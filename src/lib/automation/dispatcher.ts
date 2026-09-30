import mime from 'mime';
import appStore, { cancelVideoExport, startFfmpegVideoExport } from '@/app/actions/app';
import audioStore, { loadAudioFile } from '@/app/actions/audio';
import projectStore, {
  markProjectSaved,
  newProject,
  openProjectData,
  serializeProjectFile,
  snapshotProject,
} from '@/app/actions/project';
import { listTimelineElements } from '@/app/actions/timeline';
import { getDesktopBridge, isFfmpegAvailable } from '@/app/desktop';
import { projectDocument } from '@/app/document';
import { api, player, renderBackend, renderer, stage } from '@/app/global';
import AudioReactor from '@/lib/audio/AudioReactor';
import type Display from '@/lib/core/Display';
import type Entity from '@/lib/core/Entity';
import Scene from '@/lib/core/Scene';
import { canReorder, layerKind } from '@/lib/document/selection';
import type { DocumentOp } from '@/lib/document/types';
import {
  getProjectDuration,
  getProjectFps,
  getTransportState,
  pauseTransport,
  playTransport,
  seekTransport,
  stopTransport,
} from '@/lib/timeline/transport';
import { getVideoEncoderConfig } from '@/lib/video/encoders';
import { isVideoExportCancelledError } from '@/lib/video/VideoExporter';
import { type CommandArgs, type CommandName, commands } from './protocol';
import {
  assertSafe,
  type EntityType,
  getType,
  getTypes,
  resolvedControls,
  validateProperties,
  validateSnapshot,
} from './validation';

type Handlers = { [K in CommandName]: (args: CommandArgs<K>) => unknown | Promise<unknown> };
interface ExportJob {
  id: string;
  state: 'running' | 'cancelling' | 'completed' | 'cancelled' | 'failed';
  path: string;
  progress: { status: string; currentFrame?: number; totalFrames?: number };
  error?: string;
}
const jobs = new Map<string, ExportJob>();
let activeJob: ExportJob | undefined;

function automation() {
  const bridge = getDesktopBridge()?.automation;
  if (!bridge) throw new Error('Desktop automation bridge is unavailable.');
  return bridge;
}

function element(id: string): Display {
  const found = projectDocument.findLayer(id);
  if (!found) throw new Error(`Element not found: ${id}`);
  return found;
}

function reactor(id: string): AudioReactor {
  const found = projectDocument.findReactor(id);
  if (!found) throw new Error(`Reactor not found: ${id}`);
  return found;
}

/** The published JSON of a layer, after the command's change. */
function layerJSON(id: string) {
  const state = projectDocument.getState();
  return compact(state.elementById[id] ?? state.sceneById[id]);
}

function reactorJSON(id: string) {
  return projectDocument.getState().reactors.find(item => item.id === id);
}

function entityType(entity: Entity) {
  return entity.constructor as unknown as EntityType;
}

function requireDiscard(discard: boolean) {
  const state = projectStore.getState();
  if (state.lastModified > state.opened && !discard)
    throw new Error('Unsaved project changes. Save first or explicitly set discardChanges=true.');
}

function compact(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === 'string' && item.startsWith('data:') ? '[embedded media omitted]' : item,
    ),
  );
}

async function readFile(path: string, mimeType?: string) {
  const { name, data } = await automation().readFile(path);
  return new File([new Uint8Array(data).buffer], name, {
    type: mimeType || mime.getType(name) || '',
  });
}

async function waitForFrame() {
  if (!(await renderBackend.ensureRoot())) throw new Error('Stage renderer is not ready.');
  // Register before requesting a frame so the compositor cannot win the race.
  const presented = renderBackend.waitForNextPresentation();
  renderer.requestRender();
  await presented;
}

async function waitForMedia() {
  await document.fonts.ready;
  for (const scene of stage.scenes as Scene[]) {
    for (const display of scene.displays as unknown as Display[]) {
      const img = display.image;
      if (img instanceof HTMLImageElement && img.src && !img.complete) await img.decode();
    }
  }
}

/**
 * The loaded audio at the playhead. `playing` is whether it is sounding now:
 * false past its end even while the transport plays.
 */
function audioSummary() {
  const duration = player.getDuration();
  const { time } = getTransportState();
  return {
    duration,
    position: duration > 0 ? Math.min(1, time / duration) : 0,
    playing: player.isPlaying(),
    name: audioStore.getState().sourceLabel,
  };
}

function transportSummary() {
  const { time, duration, explicitDuration, fps, playing } = getTransportState();
  return {
    time,
    duration,
    explicitDuration,
    fps,
    playing,
    position: duration > 0 ? time / duration : 0,
    audioDuration: player.getDuration(),
  };
}

/**
 * Render an absolute project time exactly as an export would draw it: audio
 * analysis, reactors, clips, fades, video frames and effect motion all come
 * from that time. The live view returns to the playhead on its next frame.
 */
async function previewAt(maxSize: number, time: number) {
  const duration = getProjectDuration();
  if (time > duration) throw new Error(`time must be within the project duration (${duration}s).`);
  pauseTransport();
  if (!(await renderBackend.ensureRoot())) throw new Error('Stage renderer is not ready.');
  await waitForMedia();
  const fps = getProjectFps();
  const wasRendering = renderer.rendering;
  renderer.stop();
  try {
    await renderer.renderAt(Math.round(time * fps) / fps, fps);
    return captureCanvas(maxSize);
  } finally {
    if (wasRendering) renderer.start();
    else renderer.requestRender();
  }
}

async function preview(maxSize: number) {
  await waitForFrame();
  await waitForMedia();
  await waitForFrame();
  return captureCanvas(maxSize);
}

function captureCanvas(maxSize: number) {
  const source = renderBackend.getCanvas();
  if (!source?.width || !source?.height) throw new Error('Stage canvas is unavailable.');
  const ratio = Math.min(1, maxSize / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * ratio));
  canvas.height = Math.max(1, Math.round(source.height * ratio));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create preview canvas.');
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return {
    data: canvas.toDataURL('image/png').split(',')[1],
    mimeType: 'image/png',
    width: canvas.width,
    height: canvas.height,
  };
}

const handlers: Handlers = {
  get_project: () =>
    compact({
      name: projectDocument.getState().name,
      ...snapshotProject(),
      unresolvedMediaRefs: projectDocument.getState().unresolvedMediaRefs,
      audio: audioSummary(),
      transport: transportSummary(),
      exportJob: activeJob?.id,
    }),
  list_element_types: () =>
    Object.entries(getTypes()).map(([name, Type]) => ({
      name,
      label: Type.config.label,
      description: Type.config.description,
      kind: name === 'Scene' ? 'scene' : Type.config.type,
    })),
  describe_element_type: ({ name, elementId }) => {
    const Type = getType(name);
    const target = elementId
      ? name === 'AudioReactor'
        ? reactor(elementId)
        : element(elementId)
      : undefined;
    if (target && target.name !== name)
      throw new Error('elementId does not match the requested type.');
    return compact({
      name,
      defaults: Type.config.defaultProperties,
      controls: resolvedControls(Type, target),
      media: Type.config.media,
      // Clip fades scale `opacity`; elements without it hard-cut at the clip edges.
      hasOpacity: typeof Type.config.defaultProperties.opacity === 'number',
    });
  },
  new_project: async ({ discardChanges }) => {
    requireDiscard(discardChanges);
    await newProject();
    return handlers.get_project({});
  },
  create_scene: ({ name }) => {
    const { id } = projectDocument.apply({ type: 'addScene', displayName: name || undefined });
    return layerJSON(id as string);
  },
  add_element: ({ sceneId, type, properties }) => {
    const scene = element(sceneId);
    if (!(scene instanceof Scene)) throw new Error('sceneId must identify a scene.');
    const Type = getType(type);
    if (type === 'Scene' || type === 'AudioReactor')
      throw new Error('Use create_scene or create_reactor.');
    validateProperties(Type, properties);
    const { id } = projectDocument.apply({
      type: 'addElement',
      element: new Type(properties),
      sceneId,
    });
    return layerJSON(id as string);
  },
  update_element: ({ id, properties, name, enabled }) => {
    const target = element(id);
    validateProperties(entityType(target), properties, target);
    projectDocument.apply([
      { type: 'setProperties', id, properties },
      { type: 'setMeta', id, displayName: name, enabled },
    ]);
    return layerJSON(id);
  },
  remove_element: ({ id }) => {
    element(id);
    projectDocument.apply({ type: 'removeLayer', id });
    return { removed: id };
  },
  reorder_element: ({ id, targetId }) => {
    element(id);
    element(targetId);
    const state = projectDocument.getState();
    if (!canReorder(layer => layerKind(state, layer), id, targetId))
      throw new Error('Cannot reorder these elements.');
    projectDocument.apply({ type: 'reorderLayer', sourceId: id, targetId });
    return { moved: id, targetId };
  },
  configure_canvas: ({ width, height, backgroundColor }) => {
    if (width * height > 33_177_600) throw new Error('Canvas exceeds 8K pixel budget.');
    projectDocument.apply({ type: 'setCanvas', width, height, backgroundColor });
    return stage.toJSON();
  },
  create_reactor: ({ properties }) => {
    validateProperties(AudioReactor, properties);
    const { id } = projectDocument.apply({
      type: 'addReactor',
      reactor: new AudioReactor(properties),
    });
    return reactorJSON(id as string);
  },
  update_reactor: ({ id, properties }) => {
    const target = reactor(id);
    validateProperties(AudioReactor, properties, target);
    projectDocument.apply({ type: 'setProperties', id, properties });
    return reactorJSON(id);
  },
  remove_reactor: ({ id }) => {
    reactor(id);
    projectDocument.apply({ type: 'removeReactor', id });
    return { removed: id };
  },
  bind_reactor: ({ elementId, property, reactorId, min, max }) => {
    const target = element(elementId);
    if (reactorId === null) {
      projectDocument.apply({ type: 'unbindReactor', id: elementId, property });
      return layerJSON(elementId);
    }
    reactor(reactorId);
    const control = resolvedControls(entityType(target), target)[property];
    if (!control?.withReactor || typeof target.properties[property] !== 'number')
      throw new Error('Property does not support a numeric reactor binding.');
    validateProperties(entityType(target), { [property]: min }, target);
    validateProperties(entityType(target), { [property]: max }, target);
    projectDocument.apply({ type: 'bindReactor', id: elementId, property, reactorId, min, max });
    return layerJSON(elementId);
  },
  get_preview: ({ maxSize, time }) =>
    time === undefined ? preview(maxSize) : previewAt(maxSize, time),
  get_timeline: () => ({ ...transportSummary(), elements: listTimelineElements().elements }),
  set_timeline: ({ duration, fps }) => {
    projectDocument.apply({ type: 'setTimeline', duration, fps });
    return handlers.get_timeline({});
  },
  set_clips: ({ clips }) => {
    for (const { id } of clips) element(id);
    projectDocument.apply(
      clips.map(({ id, ...patch }): DocumentOp => ({ type: 'setClip', id, patch })),
    );
    return clips.map(({ id }) => ({ id, clip: element(id).clip }));
  },
  clear_clips: ({ ids }) => {
    for (const id of ids) element(id);
    projectDocument.apply(ids.map((id): DocumentOp => ({ type: 'clearClip', id })));
    return { cleared: ids };
  },
  open_project: async ({ path, discardChanges }) => {
    requireDiscard(discardChanges);
    const file = await readFile(path);
    requireDiscard(discardChanges);
    const warnings = await openProjectData(file, validateSnapshot);
    return { name: projectDocument.getState().name, warnings };
  },
  save_project: async ({ path, overwrite }) => {
    const modified = projectStore.getState().lastModified;
    const result = await automation().writeProject({
      path,
      overwrite,
      text: serializeProjectFile(),
    });
    markProjectSaved(modified);
    return result;
  },
  load_media: async ({ path, kind, elementId }) => {
    if (kind === 'audio') {
      if (elementId) throw new Error('Audio belongs to the project, not an element.');
      const file = await readFile(path);
      await loadAudioFile(file, false, true);
      return { name: file.name, duration: player.getDuration() };
    }
    if (!elementId) throw new Error('elementId is required for images and videos.');
    const target = element(elementId);
    const Type = entityType(target);
    if (Type.config.media !== kind) throw new Error(`Element must support ${kind} media.`);
    const file = await readFile(path);
    const src =
      kind === 'image' ? String(await api.readImageFile(file)) : URL.createObjectURL(file);
    const previous = target.properties.src;
    try {
      const media = kind === 'image' ? new Image() : document.createElement('video');
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          cleanup();
          reject(new Error('Media loading timed out.'));
        }, 15_000);
        const cleanup = () => {
          window.clearTimeout(timer);
          media.onload = null;
          media.onerror = null;
          if (media instanceof HTMLVideoElement) media.onloadeddata = null;
        };
        const loaded = () => {
          cleanup();
          resolve();
        };
        media.onerror = () => {
          cleanup();
          reject(new Error(`Could not decode ${kind} file.`));
        };
        if (media instanceof HTMLVideoElement) {
          media.muted = true;
          media.preload = 'auto';
          media.onloadeddata = loaded;
        } else media.onload = loaded;
        media.src = src;
      });
      // Use the same decoded media path as the UI, including natural sizing.
      if (element(elementId) !== target)
        throw new Error('The target element changed while loading media.');
      projectDocument.apply({
        type: 'setProperties',
        id: elementId,
        properties: { src: media, sourcePath: path },
      });
    } catch (error) {
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      throw error;
    }
    if (typeof previous === 'string' && previous.startsWith('blob:')) URL.revokeObjectURL(previous);
    return { id: elementId, path, kind };
  },
  playback: ({ action, time, position }) => {
    if (action === 'seek') {
      if (time === undefined && position === undefined)
        throw new Error('Seek requires time (seconds) or position (0-1).');
      seekTransport(time ?? (position ?? 0) * getProjectDuration());
    } else if (action === 'play') playTransport();
    else if (action === 'pause') pauseTransport();
    else stopTransport();
    renderer.requestRender();
    return transportSummary();
  },
  start_export: async args => {
    if (!isFfmpegAvailable()) throw new Error('Bundled ffmpeg is unavailable.');
    if (args.includeAudio && !player.hasAudio())
      throw new Error('Load an audio file before exporting with audio, or set includeAudio=false.');
    const duration = getProjectDuration();
    const endTime = args.endTime ?? duration;
    if (!Number.isFinite(duration) || endTime > duration || endTime <= args.startTime)
      throw new Error(`Export range must be within the project duration (${duration}s).`);
    const { width, height } = stage.getSize();
    if (width % 2 || height % 2) throw new Error('Video export requires even canvas dimensions.');
    const extension = getVideoEncoderConfig(args.encoder).video.extension;
    if (!args.path.toLowerCase().endsWith(`.${extension}`))
      throw new Error(`This encoder requires .${extension}.`);
    const output = await automation().checkOutput({ path: args.path, overwrite: args.overwrite });
    if (appStore.getState().isVideoRecording) throw new Error('Another export is active.');
    const source = audioStore.getState().source;
    if (args.includeAudio && !source)
      throw new Error('Reload the audio file before exporting with audio.');
    pauseTransport();
    const job: ExportJob = {
      id: crypto.randomUUID(),
      state: 'running',
      path: output.path,
      progress: { status: 'preparing' },
    };
    jobs.set(job.id, job);
    activeJob = job;
    if (jobs.size > 50) jobs.delete(jobs.keys().next().value!);
    // Reserve before asynchronous audio preparation, including against UI export.
    appStore.setState({ isVideoRecording: true });
    void startFfmpegVideoExport({
      filePath: output.path,
      startTime: args.startTime,
      endTime,
      fps: args.fps ?? getProjectFps(),
      encoder: args.encoder,
      quality: args.quality,
      includeAudio: args.includeAudio,
      audioSource: source,
      automation: {
        overwrite: args.overwrite,
        onProgress: progress => {
          job.progress = progress;
          if (job.state === 'cancelling') cancelVideoExport();
        },
      },
    })
      .then(ok => {
        if (!ok) throw new Error('Export could not be started.');
        job.state = 'completed';
      })
      .catch(error => {
        job.state = isVideoExportCancelledError(error) ? 'cancelled' : 'failed';
        job.error = error instanceof Error ? error.message : String(error);
      })
      .finally(() => {
        activeJob = undefined;
        appStore.setState({ isVideoRecording: false, statusText: '' });
      });
    return { ...job };
  },
  get_export_status: ({ jobId }) => {
    const job = jobs.get(jobId);
    if (!job) throw new Error('Export job not found (possibly an editor reload).');
    return { ...job };
  },
  cancel_export: ({ jobId }) => {
    const job = jobs.get(jobId);
    if (!job) throw new Error('Export job not found.');
    if (job === activeJob) {
      job.state = 'cancelling';
      cancelVideoExport();
    }
    return { ...job };
  },
};

export function connectAutomation() {
  const bridge = automation();
  let busy = false;
  return bridge.onCommand(async request => {
    try {
      if (Date.now() > request.deadline) throw new Error('Command expired before execution.');
      if (busy) throw new Error('Another command is running.');
      if (!Object.hasOwn(commands, request.command)) throw new Error('Unknown automation command.');
      const definition = commands[request.command];
      if (
        (activeJob || appStore.getState().isVideoRecording) &&
        ![
          'get_project',
          'list_element_types',
          'describe_element_type',
          'get_export_status',
          'cancel_export',
        ].includes(request.command)
      )
        throw new Error('Wait for the current export to finish, or cancel it.');
      assertSafe(request.args);
      const args = definition.schema.parse(request.args);
      busy = true;
      try {
        const handler = handlers[request.command] as (input: typeof args) => unknown;
        const result = await handler(args);
        bridge.respond({ id: request.id, result });
      } finally {
        busy = false;
      }
    } catch (error) {
      bridge.respond({
        id: request.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

import mime from 'mime';
import appStore, { cancelVideoExport, startFfmpegVideoExport } from '@/app/actions/app';
import audioStore, { loadAudioFile } from '@/app/actions/audio';
import projectStore, {
  markProjectSaved,
  newProject,
  openProjectData,
  serializeProjectFile,
  snapshotProject,
  touchProject,
} from '@/app/actions/project';
import { addReactor, loadReactors, removeReactor } from '@/app/actions/reactors';
import {
  addElement,
  addScene,
  loadScenes,
  removeElement,
  reorderElement,
  updateElement,
  updateElementProperties,
} from '@/app/actions/scenes';
import { updateCanvas } from '@/app/actions/stage';
import { getDesktopBridge, isFfmpegAvailable } from '@/app/desktop';
import { api, player, reactors, renderBackend, renderer, stage } from '@/app/global';
import AudioReactor from '@/lib/audio/AudioReactor';
import Display from '@/lib/core/Display';
import type Entity from '@/lib/core/Entity';
import Scene from '@/lib/core/Scene';
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
  const found = stage.getStageElementById(id);
  if (!(found instanceof Display)) throw new Error(`Element not found: ${id}`);
  return found;
}

function reactor(id: string): AudioReactor {
  const found = reactors.getElementById(id);
  if (!(found instanceof AudioReactor)) throw new Error(`Reactor not found: ${id}`);
  return found;
}

function entityType(entity: Entity) {
  return entity.constructor as unknown as EntityType;
}

function requireDiscard(discard: boolean) {
  const state = projectStore.getState();
  if (state.lastModified > state.opened && !discard)
    throw new Error('Unsaved project changes. Save first or explicitly set discardChanges=true.');
}

function edited() {
  loadScenes(false);
  loadReactors();
  touchProject();
  renderer.requestRender();
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

async function preview(maxSize: number) {
  await waitForFrame();
  await document.fonts.ready;
  for (const scene of stage.scenes as Scene[]) {
    for (const display of scene.displays as unknown as Display[]) {
      const img = display.image;
      if (img instanceof HTMLImageElement && img.src && !img.complete) await img.decode();
    }
  }
  await waitForFrame();
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
      name: projectStore.getState().projectName,
      ...snapshotProject(),
      unresolvedMediaRefs: projectStore.getState().unresolvedMediaRefs,
      audio: {
        duration: player.getDuration(),
        position: player.getPosition(),
        playing: player.isPlaying(),
        name: audioStore.getState().sourceLabel,
      },
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
    });
  },
  new_project: async ({ discardChanges }) => {
    requireDiscard(discardChanges);
    await newProject();
    return handlers.get_project({});
  },
  create_scene: ({ name }) => {
    const scene = addScene() as Scene;
    if (name) updateElement(scene.id, 'displayName', name);
    return scene.toJSON();
  },
  add_element: ({ sceneId, type, properties }) => {
    const scene = element(sceneId);
    if (!(scene instanceof Scene)) throw new Error('sceneId must identify a scene.');
    const Type = getType(type);
    if (type === 'Scene' || type === 'AudioReactor')
      throw new Error('Use create_scene or create_reactor.');
    validateProperties(Type, properties);
    const created = new Type(properties);
    addElement(created, sceneId);
    return created.toJSON();
  },
  update_element: ({ id, properties, name, enabled }) => {
    const target = element(id);
    validateProperties(entityType(target), properties, target);
    updateElementProperties(id, properties);
    if (name !== undefined) updateElement(id, 'displayName', name);
    if (enabled !== undefined) updateElement(id, 'enabled', enabled);
    edited();
    return compact(target.toJSON());
  },
  remove_element: ({ id }) => {
    element(id);
    removeElement(id);
    return { removed: id };
  },
  reorder_element: ({ id, targetId }) => {
    element(id);
    element(targetId);
    if (!reorderElement(id, targetId)) throw new Error('Cannot reorder these elements.');
    return { moved: id, targetId };
  },
  configure_canvas: ({ width, height, backgroundColor }) => {
    if (width * height > 33_177_600) throw new Error('Canvas exceeds 8K pixel budget.');
    updateCanvas(width, height, backgroundColor);
    return stage.toJSON();
  },
  create_reactor: ({ properties }) => {
    validateProperties(AudioReactor, properties);
    const created = new AudioReactor(properties);
    addReactor(created);
    edited();
    return created.toJSON();
  },
  update_reactor: ({ id, properties }) => {
    const target = reactor(id);
    validateProperties(AudioReactor, properties, target);
    target.update(properties);
    edited();
    return target.toJSON();
  },
  remove_reactor: ({ id }) => {
    removeReactor(reactor(id));
    edited();
    return { removed: id };
  },
  bind_reactor: ({ elementId, property, reactorId, min, max }) => {
    const target = element(elementId);
    if (reactorId === null) {
      target.removeReactor(property);
      edited();
      return compact(target.toJSON());
    }
    reactor(reactorId);
    const control = resolvedControls(entityType(target), target)[property];
    if (!control?.withReactor || typeof target.properties[property] !== 'number')
      throw new Error('Property does not support a numeric reactor binding.');
    validateProperties(entityType(target), { [property]: min }, target);
    validateProperties(entityType(target), { [property]: max }, target);
    target.setReactor(property, { id: reactorId, min, max });
    edited();
    return compact(target.toJSON());
  },
  get_preview: ({ maxSize }) => preview(maxSize),
  open_project: async ({ path, discardChanges }) => {
    requireDiscard(discardChanges);
    const file = await readFile(path);
    requireDiscard(discardChanges);
    const warnings = await openProjectData(file, validateSnapshot);
    return { name: projectStore.getState().projectName, warnings };
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
      target.update({ src: media, sourcePath: path });
      edited();
    } catch (error) {
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      throw error;
    }
    if (typeof previous === 'string' && previous.startsWith('blob:')) URL.revokeObjectURL(previous);
    return { id: elementId, path, kind };
  },
  playback: ({ action, position }) => {
    if (!player.hasAudio()) throw new Error('Load an audio file first.');
    if (action === 'seek') {
      if (position === undefined) throw new Error('Seek requires position.');
      player.seek(position);
    } else if (action === 'play') player.play();
    else player.pause();
    renderer.requestRender();
    return { playing: player.isPlaying(), position: player.getPosition() };
  },
  start_export: async args => {
    if (!isFfmpegAvailable()) throw new Error('Bundled ffmpeg is unavailable.');
    if (!player.hasAudio()) throw new Error('Load an audio file before exporting.');
    const duration = player.getDuration();
    const endTime = args.endTime ?? duration;
    if (!Number.isFinite(duration) || endTime > duration || endTime <= args.startTime)
      throw new Error('Export range must be within the loaded audio duration.');
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
    player.pause();
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
      fps: args.fps,
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

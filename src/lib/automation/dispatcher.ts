import mime from 'mime';
import audioStore, { audioSource } from '@/app/actions/audio';
import { type ExportJob, getActiveExport, getExportMode, startExport } from '@/app/actions/export';
import { listTimelineElements } from '@/app/actions/timeline';
import { projectDocument } from '@/app/document';
import { player, renderBackend, renderer, stage } from '@/app/global';
import { media } from '@/app/media';
import { project } from '@/app/project';
import AudioReactor from '@/lib/audio/AudioReactor';
import type Display from '@/lib/core/Display';
import type Entity from '@/lib/core/Entity';
import Scene from '@/lib/core/Scene';
import { canReorder, layerKind } from '@/lib/document/selection';
import type { DocumentOp } from '@/lib/document/types';
import { platform } from '@/lib/platform';
import { EASINGS, type Keyframe, setKey, trackTypeFor } from '@/lib/timeline/tracks';
import {
  getProjectDuration,
  getProjectFps,
  getTransportState,
  pauseTransport,
  playTransport,
  seekTransport,
  setTransportLoop,
  stopTransport,
} from '@/lib/timeline/transport';
import { getVideoEncoderConfig } from '@/lib/video/encoders';
import { type CommandArgs, type CommandName, type ImageResult, parseCommand } from './protocol';
import {
  type EntityType,
  getType,
  getTypes,
  resolvedControls,
  validateProperties,
  validateSnapshot,
} from './validation';

type Handlers = { [K in CommandName]: (args: CommandArgs<K>) => unknown | Promise<unknown> };
/** Export jobs started over MCP, kept for get_export_status until the editor reloads. */
const jobs = new Map<string, ExportJob>();
const MAX_JOBS = 50;

function jobSummary(job: ExportJob) {
  return {
    id: job.id,
    state: job.state,
    path: job.savedPath ?? job.plan.output.path,
    progress: { ...job.progress },
    ...(job.error ? { error: job.error } : {}),
  };
}

function automation() {
  const bridge = platform.automation;
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

/** Which of a type's properties can be animated, and as what. */
function animatable(Type: EntityType) {
  return Object.fromEntries(
    Object.keys(Type.config.controls ?? {})
      .map(property => [property, trackTypeFor(Type.config, property)])
      .filter(([, type]) => type !== null),
  );
}

/**
 * Check one keyframe value like a property value: within the control's bounds,
 * except on unbounded controls (rotation), where only a finite number is needed.
 */
function validateKeyValue(target: Display, property: string, value: unknown) {
  const Type = entityType(target);
  const control = resolvedControls(Type, target)[property];

  if (control?.unbounded === true && typeof value === 'number') {
    if (!Number.isFinite(value) || Math.abs(value) > 1e8)
      throw new Error(`${property} is outside the supported numeric range.`);
    return;
  }

  validateProperties(Type, { [property]: value }, target);
}

function requireDiscard(discard: boolean) {
  if (project.isModified() && !discard)
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
  const { time, duration, explicitDuration, fps, playing, loop } = getTransportState();
  return {
    time,
    duration,
    explicitDuration,
    fps,
    playing,
    loop,
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
  const fps = getProjectFps();
  return renderer.offline(fps, async frames => {
    await frames.renderAt(Math.round(time * fps) / fps);
    return captureCanvas(maxSize);
  });
}

async function preview(maxSize: number) {
  await waitForFrame();
  await waitForMedia();
  await waitForFrame();
  return captureCanvas(maxSize);
}

function captureCanvas(maxSize: number): ImageResult {
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
      ...project.toFile(),
      unresolvedMediaRefs: projectDocument.getState().unresolvedMediaRefs,
      audio: audioSummary(),
      transport: transportSummary(),
      exportJob: getActiveExport()?.id,
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
      ...(name === 'AudioReactor' ? {} : { animatable: animatable(Type), easings: EASINGS }),
    });
  },
  new_project: async ({ discardChanges }) => {
    requireDiscard(discardChanges);
    project.create();
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
    const animated = Object.keys(properties).filter(property => target.tracks[property]);
    if (animated.length > 0)
      throw new Error(
        `Animated properties cannot be set directly: ${animated.join(', ')}. Use set_keyframes, or clear_keyframes first.`,
      );
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
  bind_reactor: ({ elementId, property, reactorId, min, max, mode }) => {
    const target = element(elementId);
    if (reactorId === null) {
      projectDocument.apply({ type: 'unbindReactor', id: elementId, property });
      return layerJSON(elementId);
    }
    reactor(reactorId);
    const control = resolvedControls(entityType(target), target)[property];
    if (!control?.withReactor || typeof target.properties[property] !== 'number')
      throw new Error('Property does not support a numeric reactor binding.');
    if (mode === 'replace') {
      validateProperties(entityType(target), { [property]: min }, target);
      validateProperties(entityType(target), { [property]: max }, target);
    }
    projectDocument.apply({
      type: 'bindReactor',
      id: elementId,
      property,
      reactorId,
      min,
      max,
      mode,
    });
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
  set_keyframes: ({ tracks }) => {
    const ops = tracks.map(({ id, property, keyframes, mode }): DocumentOp => {
      const target = element(id);
      if (!trackTypeFor(entityType(target).config, property))
        throw new Error(`${property} cannot be animated.`);
      for (const key of keyframes) validateKeyValue(target, property, key.value);
      const base: Keyframe[] = mode === 'merge' ? (target.tracks[property]?.keyframes ?? []) : [];
      const merged = [...keyframes]
        .sort((a, b) => a.time - b.time)
        .reduce((keys, key) => setKey(keys, key), base);
      return { type: 'setTrack', id, property, keyframes: merged };
    });
    projectDocument.apply(ops);
    return tracks.map(({ id }) => ({ id, tracks: element(id).tracks }));
  },
  clear_keyframes: ({ id, properties }) => {
    element(id);
    projectDocument.apply({ type: 'clearTracks', id, properties });
    return layerJSON(id);
  },
  open_project: async ({ path, discardChanges }) => {
    requireDiscard(discardChanges);
    const file = await readFile(path);
    requireDiscard(discardChanges);
    const warnings = await project.open(file, { validate: validateSnapshot });
    return { name: projectDocument.getState().name, warnings };
  },
  save_project: ({ path, overwrite }) =>
    project.save(({ text }) => automation().writeProject({ path, overwrite, text })),
  load_media: async ({ path, kind, elementId }) => {
    if (kind === 'audio') {
      if (elementId) throw new Error('Audio belongs to the project, not an element.');
      const file = await readFile(path);
      await audioSource.loadFile(file, { play: false });
      return { name: file.name, duration: player.getDuration() };
    }
    if (!elementId) throw new Error('elementId is required for images and videos.');
    const target = element(elementId);
    const Type = entityType(target);
    if (Type.config.media !== kind) throw new Error(`Element must support ${kind} media.`);
    // A video streams from its path; an image is read so the project file carries it.
    const file = kind === 'image' ? await readFile(path) : undefined;
    const { element: decoded, sourcePath } = await media.load({ file, path }, kind);
    if (element(elementId) !== target)
      throw new Error('The target element changed while loading media.');
    projectDocument.apply({
      type: 'setProperties',
      id: elementId,
      properties: { src: decoded, sourcePath },
    });
    return { id: elementId, path, kind };
  },
  playback: ({ action, loop, time, position }) => {
    if (action === undefined && loop === undefined)
      throw new Error('Supply an action, loop, or both.');
    if (action === 'seek' && time === undefined && position === undefined)
      throw new Error('Seek requires time (seconds) or position (0-1).');
    // Set loop first so a play in the same call already knows what happens at the end.
    if (loop !== undefined) setTransportLoop(loop);
    if (action === 'seek') seekTransport(time ?? (position ?? 0) * getProjectDuration());
    else if (action === 'play') playTransport();
    else if (action === 'pause') pauseTransport();
    else if (action === 'stop') stopTransport();
    renderer.requestRender();
    return transportSummary();
  },
  start_export: async args => {
    if (getExportMode() !== 'offline') throw new Error('Bundled ffmpeg is unavailable.');
    const extension = getVideoEncoderConfig(args.encoder).video.extension;
    if (!args.path.toLowerCase().endsWith(`.${extension}`))
      throw new Error(`This encoder requires .${extension}.`);
    // MCP clients name the file themselves, so refuse to replace one unless asked.
    const output = await automation().checkOutput({ path: args.path, overwrite: args.overwrite });
    // The range, frame rate, audio and busy checks are the export's own (planExport).
    const job = startExport({
      output: { path: output.path },
      startTime: args.startTime,
      endTime: args.endTime,
      fps: args.fps,
      encoder: args.encoder,
      quality: args.quality,
      includeAudio: args.includeAudio,
      overwrite: args.overwrite,
    });
    jobs.set(job.id, job);
    if (jobs.size > MAX_JOBS) jobs.delete(jobs.keys().next().value!);
    return jobSummary(job);
  },
  get_export_status: ({ jobId }) => {
    const job = jobs.get(jobId);
    if (!job) throw new Error('Export job not found (possibly an editor reload).');
    return jobSummary(job);
  },
  cancel_export: ({ jobId }) => {
    const job = jobs.get(jobId);
    if (!job) throw new Error('Export job not found.');
    job.cancel();
    return jobSummary(job);
  },
};

export function connectAutomation() {
  const bridge = automation();
  let busy = false;
  return bridge.onCommand(async request => {
    try {
      if (Date.now() > request.deadline) throw new Error('Command expired before execution.');
      if (busy) throw new Error('Another command is running.');
      const { name, args } = parseCommand(request.command, request.args, {
        exporting: Boolean(getActiveExport()),
      });
      busy = true;
      try {
        const handler = handlers[name] as (input: unknown) => unknown;
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

import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  DEFAULT_CANVAS_BGCOLOR,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
} from '@/app/constants';
import AudioReactor from '@/lib/audio/AudioReactor';
import Display from '@/lib/core/Display';
import Entity from '@/lib/core/Entity';
import type Reactors from '@/lib/core/Reactors';
import Scene from '@/lib/core/Scene';
import type Stage from '@/lib/core/Stage';
import { type Clip, mergeClip } from '@/lib/timeline/clip';
import {
  isValidFps,
  isValidProjectDuration,
  MAX_PROJECT_DURATION,
  MIN_PROJECT_DURATION,
  normalizeTimelineSettings,
  TIMELINE_FPS_OPTIONS,
  type TimelineSettings,
} from '@/lib/timeline/settings';
import type { ReactorConfig } from '@/lib/types';
import { resetLabelCount } from '@/lib/utils/controls';
import { uniqueId } from '@/lib/utils/crypto';
import { canReorder } from './selection';
import {
  type ApplyOptions,
  type ApplyResult,
  type Canvas,
  DEFAULT_PROJECT_NAME,
  type DocumentChange,
  type DocumentOp,
  type DocumentSnapshot,
  type DocumentState,
  type LayerConfig,
  type LayerJSON,
  type LoadInput,
  type LoadResult,
  type MediaRef,
  type ReactorJSON,
  type SceneConfig,
  type SceneJSON,
} from './types';

type LayerConstructor = new (properties?: Record<string, unknown>) => Entity;

export interface DocumentDeps {
  stage: Stage;
  reactors: Reactors;
  /** The display or effect class registered under a name (core or plugin). */
  resolveType(name: string): LayerConstructor | undefined;
  /** Push canvas settings to the renderer, which writes them to `stage.properties`. */
  applyCanvas(canvas: Partial<Canvas>): void;
  /** Push saved timeline settings to the transport. */
  applyTimeline(settings: TimelineSettings): void;
  requestRender(): void;
  /** The transport's project duration, which follows the audio when the saved duration is null. */
  getProjectDuration(): number;
}

export interface ProjectDocument {
  /** The published state, for React (`useStore(document.store, selector)`). */
  store: StoreApi<DocumentState>;
  getState(): DocumentState;
  snapshot(): DocumentSnapshot;
  /** Apply one op, or several as a single change (one undo step). */
  apply(ops: DocumentOp | DocumentOp[], options?: ApplyOptions): ApplyResult;
  /** Replace the whole document. Not an undo step. */
  load(input: LoadInput): LoadResult;
  /** The live scene, display or effect the renderer draws. */
  findLayer(id: string): Display | undefined;
  findReactor(id: string): AudioReactor | undefined;
  subscribe(listener: (change: DocumentChange) => void): () => void;
}

type Located =
  | { kind: 'scene'; entity: Scene; index: number }
  | { kind: 'display' | 'effect'; entity: Display; scene: Scene; index: number };

// Bookkeeping for one `apply()` call.
interface Pending {
  // Layer and reactor ids whose own JSON must be re-read from the live graph.
  dirty: Set<string>;
  created?: string;
}

const DEFAULT_CANVAS: Canvas = {
  width: DEFAULT_CANVAS_WIDTH,
  height: DEFAULT_CANVAS_HEIGHT,
  backgroundColor: DEFAULT_CANVAS_BGCOLOR,
};

function sameJSON(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function sameItems<T>(a: readonly T[], b: readonly T[]) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function moveItem(list: unknown[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return false;
  }

  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);

  return true;
}

function indexState(snapshot: DocumentSnapshot): DocumentState {
  const sceneOrder: string[] = [];
  const sceneById: DocumentState['sceneById'] = {};
  const elementById: DocumentState['elementById'] = {};
  const sceneElementsById: DocumentState['sceneElementsById'] = {};
  const elementParentSceneId: DocumentState['elementParentSceneId'] = {};

  for (const scene of snapshot.scenes) {
    sceneOrder.push(scene.id);
    sceneById[scene.id] = scene;
    sceneElementsById[scene.id] = {
      displays: scene.displays.map(display => display.id),
      effects: scene.effects.map(effect => effect.id),
    };

    for (const element of [...scene.displays, ...scene.effects]) {
      elementById[element.id] = element;
      elementParentSceneId[element.id] = scene.id;
    }
  }

  return {
    ...snapshot,
    sceneOrder,
    sceneById,
    elementById,
    sceneElementsById,
    elementParentSceneId,
  };
}

/**
 * The editable content of a project: canvas, scenes with their displays and
 * effects, reactors, timeline settings, name and unresolved media.
 *
 * The live object graph (`stage`, `reactors`) is the only copy that is edited.
 * Every edit goes through `apply()`, which then publishes an immutable
 * snapshot for React, undo and saving. Unchanged layers keep their published
 * object, so selectors and memoized rows only update for what changed.
 */
export function createDocument(deps: DocumentDeps): ProjectDocument {
  const { stage, reactors } = deps;
  const listeners = new Set<(change: DocumentChange) => void>();

  let timeline: TimelineSettings = normalizeTimelineSettings(undefined);
  let name = DEFAULT_PROJECT_NAME;
  let unresolvedMediaRefs: MediaRef[] = [];

  const store = createStore<DocumentState>(() =>
    indexState({
      canvas: readCanvas(),
      scenes: [],
      reactors: [],
      timeline,
      name,
      unresolvedMediaRefs,
    }),
  );

  function readCanvas(previous?: Canvas): Canvas {
    const { width, height, backgroundColor } = stage.properties as unknown as Canvas;
    const canvas = { width, height, backgroundColor };

    return previous && sameJSON(previous, canvas) ? previous : canvas;
  }

  // ---- Lookup ---------------------------------------------------------------

  function scenes() {
    return stage.scenes as unknown as Scene[];
  }

  function findLayer(id: string): Display | undefined {
    const found = stage.getStageElementById(id);
    return found instanceof Display ? found : undefined;
  }

  function findReactor(id: string): AudioReactor | undefined {
    const found = reactors.getElementById(id);
    return found instanceof AudioReactor ? found : undefined;
  }

  function locate(id: string): Located | null {
    const all = scenes();
    const sceneIndex = all.findIndex(scene => scene.id === id);

    if (sceneIndex > -1) {
      return { kind: 'scene', entity: all[sceneIndex], index: sceneIndex };
    }

    for (const scene of all) {
      const displays = scene.displays as unknown as Display[];
      const effects = scene.effects as unknown as Display[];
      const displayIndex = displays.findIndex(display => display.id === id);

      if (displayIndex > -1) {
        return { kind: 'display', entity: displays[displayIndex], scene, index: displayIndex };
      }

      const effectIndex = effects.findIndex(effect => effect.id === id);

      if (effectIndex > -1) {
        return { kind: 'effect', entity: effects[effectIndex], scene, index: effectIndex };
      }
    }

    return null;
  }

  function collection(scene: Scene, kind: 'display' | 'effect') {
    return (kind === 'effect' ? scene.effects : scene.displays) as unknown as Display[];
  }

  // ---- Building live objects from config -------------------------------------

  function buildElement(config: LayerConfig, result?: LoadResult): Display | null {
    const typeName = config.name ?? '';
    const Type = deps.resolveType(typeName);

    if (Type) {
      return Display.create(Type, config) as Display;
    }

    if (result) {
      // External elements record their plugin's source URL so a reinstall can be offered.
      if (config.plugin?.url || typeName.startsWith('@')) {
        if (!result.missingPlugins.some(plugin => plugin.name === typeName)) {
          result.missingPlugins.push({ name: typeName, url: config.plugin?.url });
        }
      } else {
        const displayName = typeof config.displayName === 'string' ? config.displayName : '';
        result.missing.push(
          displayName && displayName !== typeName ? `${displayName} (${typeName})` : typeName,
        );
      }
    }

    return null;
  }

  function buildScene(config: SceneConfig, index?: number, result?: LoadResult): Scene {
    const scene = Display.create(Scene, config) as Scene;

    // Elements size themselves from the stage, so the scene joins it first.
    stage.addScene(scene, index);

    for (const child of [...(config.displays ?? []), ...(config.effects ?? [])]) {
      const element = buildElement(child, result);

      if (element) {
        scene.addElement(element as never);
      }
    }

    return scene;
  }

  // ---- Ops ------------------------------------------------------------------

  function unbindEverywhere(reactorId: string, pending: Pending) {
    for (const scene of scenes()) {
      const layers = [
        scene as Display,
        ...(scene.displays as unknown as Display[]),
        ...(scene.effects as unknown as Display[]),
      ];

      for (const layer of layers) {
        for (const [property, binding] of Object.entries(layer.reactors)) {
          if (binding.id === reactorId) {
            layer.removeReactor(property);
            pending.dirty.add(layer.id);
          }
        }
      }
    }
  }

  function removedIds(located: Located) {
    if (located.kind !== 'scene') {
      return [located.entity.id];
    }

    const scene = located.entity;
    return [
      scene.id,
      ...(scene.displays as unknown as Display[]).map(display => display.id),
      ...(scene.effects as unknown as Display[]).map(effect => effect.id),
    ];
  }

  function duplicate(id: string, pending: Pending) {
    const located = locate(id);

    if (!located) {
      return;
    }

    const copy = structuredClone(located.entity.toJSON()) as SceneConfig;
    const idMap = new Map<string, string>();
    const reassign = (config: LayerConfig) => {
      const nextId = uniqueId();
      idMap.set(config.id, nextId);
      config.id = nextId;
    };

    reassign(copy);
    copy.displays?.forEach(reassign);
    copy.effects?.forEach(reassign);
    copy.displayName = `${located.entity.displayName || located.entity.name} (copy)`;

    if (located.kind === 'scene') {
      buildScene(copy, located.index + 1);
    } else {
      const element = buildElement(copy);

      if (!element) {
        return;
      }

      located.scene.addElement(element as never, located.index + 1);
    }

    // The copy points at the same missing file as the original.
    const copiedRefs = unresolvedMediaRefs
      .filter(ref => idMap.has(ref.displayId))
      .map(ref => ({ ...ref, displayId: idMap.get(ref.displayId) as string }));

    if (copiedRefs.length > 0) {
      unresolvedMediaRefs = [...unresolvedMediaRefs, ...copiedRefs];
    }

    pending.created = copy.id;
  }

  function reorder(sourceId: string, targetId: string) {
    if (!canReorder(id => locate(id)?.kind ?? null, sourceId, targetId)) {
      return;
    }

    const source = locate(sourceId) as Located;
    const target = locate(targetId) as Located;

    if (source.kind === 'scene') {
      moveItem(stage.scenes, source.index, target.index);
      return;
    }

    if (target.kind === 'scene') {
      // Dropped onto a scene row: move to the end of that scene's collection.
      const destination = collection(target.entity, source.kind);

      if (source.scene === target.entity) {
        moveItem(destination, source.index, destination.length - 1);
      } else {
        source.scene.removeElement(source.entity as never, false);
        target.entity.addElement(source.entity as never);
      }
      return;
    }

    if (source.scene === target.scene) {
      moveItem(collection(source.scene, source.kind), source.index, target.index);
    } else {
      source.scene.removeElement(source.entity as never, false);
      target.scene.addElement(source.entity as never, target.index);
    }
  }

  function forgetUnresolvedMedia(ids: Set<string>) {
    if (unresolvedMediaRefs.some(ref => ids.has(ref.displayId))) {
      unresolvedMediaRefs = unresolvedMediaRefs.filter(ref => !ids.has(ref.displayId));
    }
  }

  function run(op: DocumentOp, pending: Pending) {
    switch (op.type) {
      case 'setProperties': {
        const target = findLayer(op.id) ?? findReactor(op.id);

        if (target) {
          target.update(op.properties);
          pending.dirty.add(op.id);

          // New media (or none) replaces the file that could not be found.
          if ('sourcePath' in op.properties) {
            forgetUnresolvedMedia(new Set([op.id]));
          }
        }
        break;
      }

      case 'setMeta': {
        const target = findLayer(op.id) ?? findReactor(op.id);

        if (target) {
          if (op.displayName !== undefined) target.displayName = op.displayName;
          if (op.enabled !== undefined) target.enabled = op.enabled;
          pending.dirty.add(op.id);
        }
        break;
      }

      case 'bindReactor': {
        const layer = findLayer(op.id);

        if (layer && findReactor(op.reactorId)) {
          layer.setReactor(op.property, { id: op.reactorId, min: op.min, max: op.max });
          pending.dirty.add(op.id);
        }
        break;
      }

      case 'unbindReactor': {
        const layer = findLayer(op.id);

        if (layer) {
          layer.removeReactor(op.property);
          pending.dirty.add(op.id);
        }
        break;
      }

      case 'setBindings': {
        const layer = findLayer(op.id);

        if (layer) {
          const bindings: Record<string, ReactorConfig> = {};

          for (const [property, binding] of Object.entries(op.bindings)) {
            if (findReactor(binding.id)) {
              bindings[property] = { ...binding };
            }
          }

          layer.clearReactors();

          for (const [property, binding] of Object.entries(bindings)) {
            layer.setReactor(property, binding);
          }

          pending.dirty.add(op.id);
        }
        break;
      }

      case 'setClip': {
        const layer = findLayer(op.id);

        if (layer) {
          layer.setClip(mergeClip(layer.clip, op.patch, projectDuration(), timeline.fps));
          pending.dirty.add(op.id);
        }
        break;
      }

      case 'clearClip': {
        const layer = findLayer(op.id);

        if (layer) {
          layer.setClip(null);
          pending.dirty.add(op.id);
        }
        break;
      }

      case 'addScene': {
        const scene = (op.scene as Scene | undefined) ?? new Scene();

        if (op.displayName !== undefined) {
          scene.displayName = op.displayName;
        }

        stage.addScene(scene);
        pending.created = scene.id;
        break;
      }

      case 'addElement': {
        const element = op.element as Display;
        const scene =
          (op.sceneId ? (stage.getSceneById(op.sceneId) as Scene | undefined) : undefined) ??
          scenes()[0];

        if (scene) {
          scene.addElement(element as never);
          pending.created = element.id;
        }
        break;
      }

      case 'duplicateLayer':
        duplicate(op.id, pending);
        break;

      case 'removeLayer': {
        const located = locate(op.id);

        if (located) {
          const ids = new Set(removedIds(located));

          stage.removeStageElement(located.entity);
          forgetUnresolvedMedia(ids);
        }
        break;
      }

      case 'moveLayer': {
        const located = locate(op.id);

        if (located) {
          const list =
            located.kind === 'scene'
              ? (stage.scenes as unknown as unknown[])
              : collection(located.scene, located.kind);

          moveItem(list, located.index, located.index + op.spaces);
        }
        break;
      }

      case 'reorderLayer':
        reorder(op.sourceId, op.targetId);
        break;

      case 'addReactor': {
        const reactor = reactors.addReactor(op.reactor) as AudioReactor;
        pending.created = reactor.id;
        break;
      }

      case 'removeReactor': {
        const reactor = findReactor(op.id);

        if (reactor) {
          unbindEverywhere(reactor.id, pending);
          reactors.removeReactor(reactor);
        }
        break;
      }

      case 'setCanvas': {
        const canvas: Partial<Canvas> = {};

        if (op.width !== undefined) canvas.width = op.width;
        if (op.height !== undefined) canvas.height = op.height;
        if (op.backgroundColor !== undefined) canvas.backgroundColor = op.backgroundColor;

        deps.applyCanvas(canvas);
        break;
      }

      case 'setTimeline': {
        const duration = op.duration === undefined ? timeline.duration : op.duration;
        const fps = op.fps === undefined ? timeline.fps : op.fps;

        if (duration !== null && !isValidProjectDuration(duration)) {
          throw new Error(
            `Project duration must be between ${MIN_PROJECT_DURATION} and ${MAX_PROJECT_DURATION} seconds.`,
          );
        }

        if (!isValidFps(fps)) {
          throw new Error(`Frame rate must be one of ${TIMELINE_FPS_OPTIONS.join(', ')}.`);
        }

        if (duration !== timeline.duration || fps !== timeline.fps) {
          timeline = { duration, fps };
          deps.applyTimeline(timeline);
        }
        break;
      }

      case 'setName':
        name = op.name.trim() || DEFAULT_PROJECT_NAME;
        break;

      case 'setUnresolvedMediaRefs':
        unresolvedMediaRefs = op.refs;
        break;
    }
  }

  // ---- Publishing -------------------------------------------------------------

  /**
   * Read the live graph into a snapshot. Layers not in `dirty` reuse their
   * previously published object; dirty ones do too when their JSON is unchanged.
   */
  function read(previous: DocumentState | null, dirty: Set<string> | 'all'): DocumentSnapshot {
    const isDirty = (id: string) => dirty === 'all' || dirty.has(id);

    const layer = <T extends LayerJSON>(entity: Display, prev: T | undefined, json: () => T) => {
      if (prev && !isDirty(entity.id)) {
        return prev;
      }

      const next = json();
      return prev && sameJSON(prev, next) ? prev : next;
    };

    const nextScenes = scenes().map(scene => {
      const prev = previous?.sceneById[scene.id];
      const displays = (scene.displays as unknown as Display[]).map(display =>
        layer(display, previous?.elementById[display.id], () => display.toJSON() as LayerJSON),
      );
      const effects = (scene.effects as unknown as Display[]).map(effect =>
        layer(effect, previous?.elementById[effect.id], () => effect.toJSON() as LayerJSON),
      );

      // A scene's own JSON, without its elements.
      const ownJSON = () => Display.prototype.toJSON.call(scene) as LayerJSON;

      if (!prev) {
        return { ...ownJSON(), displays, effects } as SceneJSON;
      }

      const { displays: _displays, effects: _effects, ...prevOwn } = prev;
      const own = isDirty(scene.id) ? ownJSON() : prevOwn;
      const ownChanged = own !== prevOwn && !sameJSON(own, prevOwn);

      if (!ownChanged && sameItems(displays, prev.displays) && sameItems(effects, prev.effects)) {
        return prev;
      }

      return { ...(ownChanged ? own : prevOwn), displays, effects } as SceneJSON;
    });

    const previousReactors = new Map(previous?.reactors.map(reactor => [reactor.id, reactor]));
    const nextReactors = (reactors as unknown as AudioReactor[]).map(reactor => {
      const prev = previousReactors.get(reactor.id);

      if (prev && !isDirty(reactor.id)) {
        return prev;
      }

      const next = reactor.toJSON() as unknown as ReactorJSON;
      return prev && sameJSON(prev, next) ? prev : next;
    });

    return {
      canvas: readCanvas(previous?.canvas),
      scenes: previous && sameItems(nextScenes, previous.scenes) ? previous.scenes : nextScenes,
      reactors:
        previous && sameItems(nextReactors, previous.reactors) ? previous.reactors : nextReactors,
      timeline:
        previous && sameJSON(previous.timeline, timeline) ? previous.timeline : { ...timeline },
      name,
      unresolvedMediaRefs,
    };
  }

  function emit(change: DocumentChange) {
    for (const listener of [...listeners]) {
      listener(change);
    }
  }

  function commit(next: DocumentSnapshot, kind: DocumentChange['kind'], record: boolean) {
    const previous = store.getState();
    const changed =
      kind === 'load' ||
      next.canvas !== previous.canvas ||
      next.scenes !== previous.scenes ||
      next.reactors !== previous.reactors ||
      next.timeline !== previous.timeline ||
      next.name !== previous.name ||
      next.unresolvedMediaRefs !== previous.unresolvedMediaRefs;

    deps.requestRender();

    if (!changed) {
      return false;
    }

    const state = indexState(next);
    store.setState(state, true);
    emit({ kind, record: kind === 'change' && record, previous, state });

    return true;
  }

  function projectDuration() {
    return timeline.duration ?? deps.getProjectDuration();
  }

  /**
   * Validate every clip edit in a batch before anything changes, so a bad
   * patch fails the whole batch instead of leaving it half applied. A later
   * patch sees earlier ones to the same layer, as it will when the batch runs.
   */
  function checkClipEdits(operations: DocumentOp[]) {
    const clips = new Map<string, Clip | null>();
    let duration: number | undefined = projectDuration();
    let fps: number = timeline.fps;

    for (const op of operations) {
      if (op.type === 'setTimeline') {
        if (op.duration !== undefined) {
          // Following the audio: the new length is only known once applied.
          duration = op.duration ?? undefined;
        }

        if (op.fps !== undefined) {
          fps = op.fps;
        }
      } else if (op.type === 'clearClip') {
        clips.set(op.id, null);
      } else if (op.type === 'setClip') {
        const layer = findLayer(op.id);

        if (layer) {
          const current = clips.has(op.id) ? clips.get(op.id) : layer.clip;
          clips.set(op.id, mergeClip(current, op.patch, duration, fps));
        }
      }
    }
  }

  // ---- Interface ------------------------------------------------------------

  function apply(ops: DocumentOp | DocumentOp[], options: ApplyOptions = {}): ApplyResult {
    const pending: Pending = { dirty: new Set() };

    const operations = Array.isArray(ops) ? ops : [ops];

    checkClipEdits(operations);

    for (const op of operations) {
      run(op, pending);
    }

    const changed = commit(
      read(store.getState(), pending.dirty),
      'change',
      options.record !== false,
    );

    return { changed, id: pending.created };
  }

  function load(input: LoadInput): LoadResult {
    // Build from a private copy: live objects keep references into their config.
    const data = structuredClone(input);
    const result: LoadResult = { missing: [], missingPlugins: [] };

    stage.clearScenes();
    reactors.clearReactors();
    resetLabelCount();

    deps.applyCanvas({ ...DEFAULT_CANVAS, ...data.canvas });

    timeline = normalizeTimelineSettings(data.timeline);
    deps.applyTimeline(timeline);

    name = data.name?.trim() || DEFAULT_PROJECT_NAME;
    unresolvedMediaRefs = data.unresolvedMediaRefs ?? [];

    for (const config of data.reactors ?? []) {
      reactors.addReactor(Entity.create(AudioReactor, config));
    }

    for (const config of data.scenes ?? []) {
      buildScene(config, undefined, result);
    }

    commit(read(null, 'all'), 'load', false);

    return result;
  }

  function snapshot(): DocumentSnapshot {
    const { canvas, scenes, reactors, timeline, name, unresolvedMediaRefs } = store.getState();
    return { canvas, scenes, reactors, timeline, name, unresolvedMediaRefs };
  }

  return {
    store,
    getState: store.getState,
    snapshot,
    apply,
    load,
    findLayer,
    findReactor,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

import { create } from 'zustand';
import { uniqueId } from '@/lib/utils/crypto';
import appStore, { setActiveElementId, setActiveReactorId } from './app';
import projectStore, { loadProject, touchProject } from './project';
import reactorStore, { loadReactors } from './reactors';
import sceneStore, { loadScenes, updateElement, updateElementProperties } from './scenes';
import stageStore from './stage';

type Layer = {
  id: string;
  name: string;
  type: string;
  displayName?: string;
  properties: Record<string, unknown>;
  reactors?: Record<string, { id: string; min: number; max: number }>;
  displays?: Layer[];
  effects?: Layer[];
};
type PropertyClipboard = Pick<Layer, 'name' | 'type' | 'properties' | 'reactors'>;
type SceneSnapshot = Layer & { displays: Layer[]; effects: Layer[] };

function snapshot() {
  const { width, height, backgroundColor } = stageStore.getState();
  const { projectName, unresolvedMediaRefs } = projectStore.getState();
  return structuredClone({
    scenes: sceneStore.getState().scenes as SceneSnapshot[],
    reactors: reactorStore.getState().reactors,
    stage: { properties: { width, height, backgroundColor } },
    projectName,
    unresolvedMediaRefs,
  });
}

type Snapshot = ReturnType<typeof snapshot>;
type Entry = { document: Snapshot; elementId: string | null; reactorId: string | null };
const historyStore = create(() => ({
  canUndo: false,
  canRedo: false,
  clipboard: null as PropertyClipboard | null,
}));
const past: Entry[] = [];
const future: Entry[] = [];
let current: Entry | null = null;
let restoring = false;
let initialized = false;
let queued = false;
let gesture = false;
let gestureRecorded = false;

function entry(): Entry {
  const { activeElementId, activeReactorId } = appStore.getState();
  return { document: snapshot(), elementId: activeElementId, reactorId: activeReactorId };
}

function publish() {
  historyStore.setState({ canUndo: past.length > 0, canRedo: future.length > 0 });
}

// Capture after all stores and their live rendering objects have been updated.
export function flushHistory() {
  queued = false;
  if (restoring || !current) return;
  const next = entry();
  if (JSON.stringify(next.document) === JSON.stringify(current.document)) return;
  if (!gesture || !gestureRecorded) {
    past.push(current);
    if (past.length > 100) past.shift();
  }
  gestureRecorded = gesture;
  current = next;
  future.length = 0;
  touchProject();
  publish();
}

function scheduleCapture() {
  if (restoring || queued) return;
  queued = true;
  queueMicrotask(() => {
    if (queued) flushHistory();
  });
}

export function resetHistory() {
  queued = false;
  past.length = 0;
  future.length = 0;
  gesture = false;
  gestureRecorded = false;
  current = entry();
  historyStore.setState({ clipboard: null });
  publish();
}

export function initializeHistory() {
  if (initialized) return;
  initialized = true;
  resetHistory();
  sceneStore.subscribe(scheduleCapture);
  reactorStore.subscribe(scheduleCapture);
  stageStore.subscribe(scheduleCapture);
  projectStore.subscribe((state, previous) => {
    if (
      state.projectName !== previous.projectName ||
      state.unresolvedMediaRefs !== previous.unresolvedMediaRefs
    )
      scheduleCapture();
  });
  appStore.subscribe((state, previous) => {
    if (
      !restoring &&
      !queued &&
      current &&
      (state.activeElementId !== previous.activeElementId ||
        state.activeReactorId !== previous.activeReactorId)
    ) {
      current.elementId = state.activeElementId;
      current.reactorId = state.activeReactorId;
    }
  });
}

export function beginHistoryGesture() {
  flushHistory();
  gesture = true;
  gestureRecorded = false;
}

export function endHistoryGesture() {
  flushHistory();
  gesture = false;
  gestureRecorded = false;
}

function restore(target: Entry) {
  restoring = true;
  try {
    const data = structuredClone(target.document);
    loadProject(data, false);
    loadScenes(false);
    loadReactors();
    projectStore.setState({
      projectName: data.projectName,
      unresolvedMediaRefs: data.unresolvedMediaRefs,
    });
    const id = target.elementId;
    setActiveElementId(id && findLayer(id) ? id : null);
    setActiveReactorId(
      data.reactors.some(reactor => reactor.id === target.reactorId) ? target.reactorId : null,
    );
    touchProject();
  } finally {
    restoring = false;
  }
}

export function undo() {
  endHistoryGesture();
  const target = past.at(-1);
  if (!target || !current) return;
  restore(target);
  past.pop();
  future.push(current);
  current = target;
  publish();
}

export function redo() {
  endHistoryGesture();
  const target = future.at(-1);
  if (!target || !current) return;
  restore(target);
  future.pop();
  past.push(current);
  current = target;
  publish();
}

function findLayer(id: string): Layer | undefined {
  const state = sceneStore.getState();
  return (
    (state.sceneById as Record<string, Layer>)[id] ||
    (state.elementById as Record<string, Layer>)[id]
  );
}

export function selectedLayer(): Layer | undefined {
  const id = appStore.getState().activeElementId;
  return id ? findLayer(id) : undefined;
}

export function duplicateLayer() {
  endHistoryGesture();
  const source = selectedLayer();
  if (!source) return;
  const next = entry();
  const copy = structuredClone(source);
  const ids = new Map<string, string>();
  function assignIds(layer: Layer) {
    const id = uniqueId();
    ids.set(layer.id, id);
    layer.id = id;
    layer.displays?.forEach(assignIds);
    layer.effects?.forEach(assignIds);
  }
  assignIds(copy);
  copy.displayName = `${source.displayName || source.name} (copy)`;
  const scenes = next.document.scenes;
  const collection = scenes.some(scene => scene.id === source.id)
    ? scenes
    : scenes
        .flatMap(scene => [scene.displays, scene.effects])
        .find(items => items.some(item => item.id === source.id));
  if (!collection) return;
  (collection as Layer[]).splice(collection.findIndex(item => item.id === source.id) + 1, 0, copy);
  next.document.unresolvedMediaRefs.push(
    ...next.document.unresolvedMediaRefs
      .filter(ref => ids.has(ref.displayId))
      .map(ref => ({ ...ref, displayId: ids.get(ref.displayId)! })),
  );
  next.elementId = copy.id;
  restore(next);
  flushHistory();
}

export function copyProperties() {
  const layer = selectedLayer();
  if (layer) {
    const { name, type, properties, reactors } = layer;
    historyStore.setState({ clipboard: structuredClone({ name, type, properties, reactors }) });
  }
}

export function canPasteProperties() {
  const layer = selectedLayer();
  const clipboard = historyStore.getState().clipboard;
  return !!layer && !!clipboard && layer.name === clipboard.name && layer.type === clipboard.type;
}

export function pasteProperties() {
  if (!canPasteProperties()) return;
  endHistoryGesture();
  const layer = selectedLayer()!;
  const clipboard = historyStore.getState().clipboard!;
  const reactorIds = new Set(reactorStore.getState().reactors.map(reactor => reactor.id));
  const reactors = Object.fromEntries(
    Object.entries(clipboard.reactors || {}).filter(([, reactor]) => reactorIds.has(reactor.id)),
  );
  updateElementProperties(layer.id, structuredClone(clipboard.properties));
  updateElement(layer.id, 'reactors', structuredClone(reactors));
  flushHistory();
}

export default historyStore;

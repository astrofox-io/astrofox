import { create } from 'zustand';
import { projectDocument } from '@/app/document';
import { hasLayer } from '@/lib/document/selection';
import type { DocumentChange, DocumentSnapshot, LayerJSON } from '@/lib/document/types';
import appStore, { setActiveElementId, setActiveReactorId } from './app';

type PropertyClipboard = Pick<LayerJSON, 'name' | 'type' | 'properties' | 'reactors'>;
type Entry = { document: DocumentSnapshot; elementId: string | null; reactorId: string | null };

const MAX_ENTRIES = 100;

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
// While a pointer is down, every change after the first joins the same step,
// so a slider drag or a transform drag undoes in one go.
let gesture = false;
let gestureRecorded = false;
// Changes applied in the same task (one click or command handler) are one step.
let taskRecorded = false;

// Published document objects are immutable, so entries hold them by reference.
function entry(): Entry {
  const { activeElementId, activeReactorId } = appStore.getState();
  return {
    document: projectDocument.snapshot(),
    elementId: activeElementId,
    reactorId: activeReactorId,
  };
}

function publish() {
  historyStore.setState({ canUndo: past.length > 0, canRedo: future.length > 0 });
}

function record(change: DocumentChange) {
  if (restoring) return;

  if (change.kind === 'load') {
    // Opening or creating a project starts a new history.
    resetHistory();
    return;
  }

  if (!current) return;

  if (!change.record) {
    // Keep the change without making it a step of its own.
    current = { ...current, document: projectDocument.snapshot() };
    return;
  }

  if (!taskRecorded && (!gesture || !gestureRecorded)) {
    past.push(current);
    if (past.length > MAX_ENTRIES) past.shift();
  }

  gestureRecorded = gesture;

  if (!taskRecorded) {
    taskRecorded = true;
    queueMicrotask(() => {
      taskRecorded = false;
    });
  }

  current = entry();
  future.length = 0;
  publish();
}

export function resetHistory() {
  past.length = 0;
  future.length = 0;
  gesture = false;
  gestureRecorded = false;
  taskRecorded = false;
  current = entry();
  historyStore.setState({ clipboard: null });
  publish();
}

export function beginHistoryGesture() {
  gesture = true;
  gestureRecorded = false;
  taskRecorded = false;
}

export function endHistoryGesture() {
  gesture = false;
  gestureRecorded = false;
  taskRecorded = false;
}

export function initializeHistory() {
  if (initialized) return;
  initialized = true;
  resetHistory();
  projectDocument.subscribe(record);

  // The step records the selection that goes with it.
  appStore.subscribe((state, previous) => {
    if (
      !restoring &&
      current &&
      (state.activeElementId !== previous.activeElementId ||
        state.activeReactorId !== previous.activeReactorId)
    ) {
      current = { ...current, elementId: state.activeElementId, reactorId: state.activeReactorId };
    }
  });

  window.addEventListener('pointerdown', beginHistoryGesture, true);
  window.addEventListener('pointerup', endHistoryGesture);
  window.addEventListener('pointercancel', endHistoryGesture);
  window.addEventListener('blur', endHistoryGesture);
}

function restore(target: Entry) {
  restoring = true;
  try {
    projectDocument.load(target.document);
    const state = projectDocument.getState();
    setActiveElementId(hasLayer(state, target.elementId) ? target.elementId : null);
    setActiveReactorId(
      state.reactors.some(reactor => reactor.id === target.reactorId) ? target.reactorId : null,
    );
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

export function selectedLayer(): LayerJSON | undefined {
  const id = appStore.getState().activeElementId;
  const state = projectDocument.getState();
  return id ? state.sceneById[id] || state.elementById[id] : undefined;
}

export function duplicateLayer() {
  endHistoryGesture();
  const source = selectedLayer();
  if (!source) return;
  const { id } = projectDocument.apply({ type: 'duplicateLayer', id: source.id });
  if (id) setActiveElementId(id);
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
  const layer = selectedLayer() as LayerJSON;
  const clipboard = historyStore.getState().clipboard as PropertyClipboard;
  projectDocument.apply([
    { type: 'setProperties', id: layer.id, properties: structuredClone(clipboard.properties) },
    { type: 'setBindings', id: layer.id, bindings: clipboard.reactors ?? {} },
  ]);
}

export default historyStore;

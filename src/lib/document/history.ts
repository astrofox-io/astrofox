import { createStore, type StoreApi } from 'zustand/vanilla';
import type { ProjectDocument } from './document';
import { hasLayer } from './selection';
import type { DocumentChange, DocumentSnapshot } from './types';

/** What is selected in the editor: one layer and one reactor at most. */
export interface Selection {
  elementId: string | null;
  reactorId: string | null;
}

/** The editor's selection, which every undo step records and restores. */
export interface SelectionAdapter {
  get(): Selection;
  set(selection: Selection): void;
  /** Called whenever the selection changes; returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
}

export interface HistoryDeps {
  document: ProjectDocument;
  selection: SelectionAdapter;
  /** Steps kept for undo; the oldest is dropped beyond this. */
  maxEntries?: number;
}

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Undo and redo of the Document, with the selection that went with each step.
 *
 * A step is every recorded change made in one task (a click, a command), or
 * during one gesture (a pointer drag). Loading a document (opening or creating
 * a project) starts a new history.
 *
 * A change applied with `record: false` is a fact rather than an edit (saving
 * adopts the project's name and clears its missing media), so undo and redo
 * never revert it: every step takes on the parts of the document it changed.
 */
export interface History {
  /** `canUndo` and `canRedo`, for React. */
  store: StoreApi<HistoryState>;
  undo(): void;
  redo(): void;
  /** Until `endGesture`, every recorded change after the first joins the same step. */
  beginGesture(): void;
  endGesture(): void;
  /** Stop following the document and the selection. */
  dispose(): void;
}

interface Entry {
  document: DocumentSnapshot;
  selection: Selection;
}

const MAX_ENTRIES = 100;

const SNAPSHOT_KEYS = [
  'canvas',
  'scenes',
  'reactors',
  'timeline',
  'name',
  'unresolvedMediaRefs',
] as const satisfies readonly (keyof DocumentSnapshot)[];

/** Snapshots are rebuilt on every call, but their parts are published objects. */
function sameDocument(a: DocumentSnapshot, b: DocumentSnapshot) {
  return SNAPSHOT_KEYS.every(key => a[key] === b[key]);
}

export function createHistory({
  document,
  selection,
  maxEntries = MAX_ENTRIES,
}: HistoryDeps): History {
  const store = createStore<HistoryState>(() => ({ canUndo: false, canRedo: false }));
  const past: Entry[] = [];
  const future: Entry[] = [];
  let current = entry();
  let restoring = false;
  let gesture = false;
  let gestureRecorded = false;
  let taskRecorded = false;

  // Published document objects are immutable, so entries hold them by reference.
  function entry(): Entry {
    return { document: document.snapshot(), selection: selection.get() };
  }

  function publish() {
    store.setState({ canUndo: past.length > 0, canRedo: future.length > 0 });
  }

  function endGesture() {
    gesture = false;
    gestureRecorded = false;
    taskRecorded = false;
  }

  function reset() {
    past.length = 0;
    future.length = 0;
    endGesture();
    current = entry();
    publish();
  }

  function record(change: DocumentChange) {
    if (restoring) return;

    if (change.kind === 'load') {
      reset();
      return;
    }

    if (!change.record) {
      // Not a step of its own, and not something undo takes back.
      const next = document.snapshot();
      const changed = SNAPSHOT_KEYS.filter(key => change.previous[key] !== change.state[key]);

      for (const step of [...past, ...future]) {
        const patched = { ...step.document };
        for (const key of changed) {
          (patched as Record<string, unknown>)[key] = next[key];
        }
        step.document = patched;
      }

      current = { ...current, document: next };
      return;
    }

    if (!taskRecorded && (!gesture || !gestureRecorded)) {
      past.push(current);
      if (past.length > maxEntries) past.shift();
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

  function followSelection() {
    // A selection change made while a document change is still being handed
    // out (another listener moving the selection off a removed layer) belongs
    // to the state after that change, which `record` captures. Only a change
    // made against the current state belongs to the current entry.
    if (restoring || !sameDocument(document.snapshot(), current.document)) return;
    current = { ...current, selection: selection.get() };
  }

  function restore(target: Entry) {
    restoring = true;

    try {
      document.load(target.document);
      const state = document.getState();
      const { elementId, reactorId } = target.selection;
      selection.set({
        elementId: hasLayer(state, elementId) ? elementId : null,
        reactorId: state.reactors.some(reactor => reactor.id === reactorId) ? reactorId : null,
      });
    } finally {
      restoring = false;
    }
  }

  const unsubscribeDocument = document.subscribe(record);
  const unsubscribeSelection = selection.subscribe(followSelection);

  return {
    store,

    undo() {
      endGesture();
      const target = past.at(-1);
      if (!target) return;
      restore(target);
      past.pop();
      future.push(current);
      current = target;
      publish();
    },

    redo() {
      endGesture();
      const target = future.at(-1);
      if (!target) return;
      restore(target);
      future.pop();
      past.push(current);
      current = target;
      publish();
    },

    beginGesture() {
      gesture = true;
      gestureRecorded = false;
      taskRecorded = false;
    },

    endGesture,

    dispose() {
      unsubscribeDocument();
      unsubscribeSelection();
    },
  };
}

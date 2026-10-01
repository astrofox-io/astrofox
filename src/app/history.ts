import { useStore } from 'zustand';
import appStore, { setActiveElementId, setActiveReactorId } from '@/app/actions/app';
import { projectDocument } from '@/app/document';
import { createHistory, type History, type HistoryState } from '@/lib/document/history';

let instance: History | undefined;
let connected = false;

/**
 * Undo and redo for the open project (`createHistory`), recording the Layers
 * and Reactors panel selection with each step. Created on first use, like
 * `projectDocument`.
 */
function get() {
  instance ??= createHistory({
    document: projectDocument,
    selection: {
      get: () => {
        const { activeElementId, activeReactorId } = appStore.getState();
        return { elementId: activeElementId, reactorId: activeReactorId };
      },
      set: ({ elementId, reactorId }) => {
        setActiveElementId(elementId);
        setActiveReactorId(reactorId);
      },
      subscribe: listener =>
        appStore.subscribe((state, previous) => {
          if (
            state.activeElementId !== previous.activeElementId ||
            state.activeReactorId !== previous.activeReactorId
          ) {
            listener();
          }
        }),
    },
  });

  return instance;
}

/** Start recording, and make each pointer drag (a slider, a transform) one step. */
export function connectHistory() {
  const history = get();

  if (connected) return;
  connected = true;

  window.addEventListener('pointerdown', history.beginGesture, true);
  window.addEventListener('pointerup', history.endGesture);
  window.addEventListener('pointercancel', history.endGesture);
  window.addEventListener('blur', history.endGesture);
}

export function undo() {
  get().undo();
}

export function redo() {
  get().redo();
}

/** End the current gesture, so the next change is a step of its own. */
export function endHistoryGesture() {
  get().endGesture();
}

export function useHistory<T>(selector: (state: HistoryState) => T): T {
  return useStore(get().store, selector);
}

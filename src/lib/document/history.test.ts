import { beforeEach, describe, expect, it } from 'vitest';
import Display from '@/lib/core/Display';
import Reactors from '@/lib/core/Reactors';
import Stage from '@/lib/core/Stage';
import { createDocument, type ProjectDocument } from './document';
import { createHistory, type History, type Selection, type SelectionAdapter } from './history';
import { hasLayer, selectionAfterRemoval } from './selection';
import type { DocumentChange, LoadInput } from './types';

class BoxDisplay extends Display {
  static config = {
    name: 'BoxDisplay',
    label: 'Box',
    type: 'display',
    defaultProperties: { width: 10 },
  };

  constructor(properties?: Record<string, unknown>) {
    super(BoxDisplay, properties);
  }
}

const fixture: LoadInput = {
  name: 'Fixture',
  reactors: [{ id: 'r1', name: 'AudioReactor', displayName: 'Reactor 1', properties: {} }],
  scenes: [
    {
      id: 's1',
      name: 'Scene',
      displayName: 's1',
      properties: {},
      displays: ['d1', 'd2', 'd3'].map(id => ({
        id,
        name: 'BoxDisplay',
        displayName: id,
        properties: {},
      })),
      effects: [],
    },
  ],
  unresolvedMediaRefs: [{ displayId: 'd1', kind: 'image', label: 'd1', sourcePath: 'C:\\a.png' }],
};

let doc: ProjectDocument;
let history: History;
let selected: Selection;
let selectionListeners: Set<() => void>;

/** The editor's selection: a value plus change listeners, like appStore. */
const selection: SelectionAdapter = {
  get: () => selected,
  set: next => select(next.elementId, next.reactorId),
  subscribe: listener => {
    selectionListeners.add(listener);
    return () => selectionListeners.delete(listener);
  },
};

function select(elementId: string | null, reactorId: string | null = selected.reactorId) {
  if (elementId === selected.elementId && reactorId === selected.reactorId) return;
  selected = { elementId, reactorId };
  for (const listener of selectionListeners) listener();
}

/** The app moves the selection off a removed layer (keepSelectionValid in app.ts). */
function keepSelectionValid({ previous, state }: DocumentChange) {
  if (selected.elementId && !hasLayer(state, selected.elementId)) {
    select(selectionAfterRemoval(previous, state, selected.elementId));
  }
}

function width(id = 'd1') {
  return doc.getState().elementById[id]?.properties.width;
}

function setWidth(value: number, id = 'd1') {
  doc.apply({ type: 'setProperties', id, properties: { width: value } });
}

/** Let the current task end, so the next change is a step of its own. */
const nextTask = () => new Promise<void>(resolve => setTimeout(resolve, 0));

function setup({ repairSelectionFirst }: { repairSelectionFirst: boolean }) {
  const stage = new Stage();
  doc = createDocument({
    stage,
    reactors: new Reactors(),
    resolveType: name => (name === 'BoxDisplay' ? BoxDisplay : undefined),
    applyCanvas: canvas => Object.assign(stage.properties, canvas),
    applyTimeline: () => {},
    requestRender: () => {},
    getProjectDuration: () => 30,
  });
  selected = { elementId: null, reactorId: null };
  selectionListeners = new Set();

  if (repairSelectionFirst) doc.subscribe(keepSelectionValid);
  history = createHistory({ document: doc, selection, maxEntries: 3 });
  if (!repairSelectionFirst) doc.subscribe(keepSelectionValid);

  doc.load(fixture);
}

beforeEach(() => setup({ repairSelectionFirst: true }));

describe('undo and redo', () => {
  it('step back and forward through recorded changes', async () => {
    setWidth(20);
    await nextTask();
    setWidth(30);

    history.undo();
    expect(width()).toBe(20);
    history.undo();
    expect(width()).toBe(10);
    history.redo();
    expect(width()).toBe(20);
  });

  it('publish whether there is anything to undo or redo', async () => {
    expect(history.store.getState()).toEqual({ canUndo: false, canRedo: false });

    setWidth(20);
    expect(history.store.getState()).toEqual({ canUndo: true, canRedo: false });

    history.undo();
    expect(history.store.getState()).toEqual({ canUndo: false, canRedo: true });
  });

  it('forget what could be redone once something new is changed', async () => {
    setWidth(20);
    history.undo();
    await nextTask();
    setWidth(40);

    history.redo();
    expect(width()).toBe(40);
    expect(history.store.getState().canRedo).toBe(false);
  });

  it('keep only the most recent steps', async () => {
    for (const value of [11, 12, 13, 14, 15]) {
      setWidth(value);
      await nextTask();
    }

    for (let step = 0; step < 5; step += 1) history.undo();

    expect(width()).toBe(12);
  });

  it('do nothing with nothing to undo or redo', () => {
    history.undo();
    history.redo();

    expect(width()).toBe(10);
  });
});

describe('steps', () => {
  it('make everything changed in one task one step', () => {
    setWidth(20);
    setWidth(30, 'd2');

    history.undo();

    expect([width(), width('d2')]).toEqual([10, 10]);
  });

  it('make a gesture one step, however many tasks it spans', async () => {
    history.beginGesture();
    setWidth(20);
    await nextTask();
    setWidth(25);
    await nextTask();
    setWidth(30);
    history.endGesture();
    await nextTask();
    setWidth(50);

    history.undo();
    expect(width()).toBe(30);
    history.undo();
    expect(width()).toBe(10);
  });

  it('keep unrecorded changes without making them a step', async () => {
    setWidth(20);
    await nextTask();
    doc.apply({ type: 'setName', name: 'Saved As' }, { record: false });

    expect(history.store.getState().canUndo).toBe(true);
    history.undo();
    expect(width()).toBe(10);
  });

  it('never take back an unrecorded change, such as saving', async () => {
    setWidth(20);
    await nextTask();
    setWidth(30);
    // Saving adopts the name and clears the missing media, outside history.
    doc.apply(
      [
        { type: 'setName', name: 'Saved As' },
        { type: 'setUnresolvedMediaRefs', refs: [] },
      ],
      { record: false },
    );

    history.undo();
    history.undo();
    expect(width()).toBe(10);
    expect(doc.getState().name).toBe('Saved As');
    expect(doc.getState().unresolvedMediaRefs).toEqual([]);

    history.redo();
    expect(width()).toBe(20);
    expect(doc.getState().name).toBe('Saved As');
  });

  it('still undoes a recorded rename', async () => {
    doc.apply({ type: 'setName', name: 'Renamed' });

    history.undo();

    expect(doc.getState().name).toBe('Fixture');
  });

  it('start over when a document is loaded', () => {
    setWidth(20);

    doc.load(fixture);

    expect(history.store.getState()).toEqual({ canUndo: false, canRedo: false });
  });
});

describe('selection', () => {
  it('is restored with the step it went with', async () => {
    select('d2');
    setWidth(20, 'd2');
    await nextTask();
    select('d3');

    history.undo();

    expect(selected.elementId).toBe('d2');
  });

  it('is cleared when the selected layer does not exist in the restored step', async () => {
    const { id } = doc.apply({ type: 'addElement', element: new BoxDisplay(), sceneId: 's1' });
    select(id as string);
    await nextTask();
    setWidth(20);

    history.undo();
    history.undo();

    expect(selected.elementId).toBeNull();
  });

  for (const repairSelectionFirst of [true, false]) {
    it(`reselects a removed layer on undo (selection repaired ${
      repairSelectionFirst ? 'before' : 'after'
    } history hears of the change)`, async () => {
      setup({ repairSelectionFirst });
      select('d2');
      await nextTask();

      doc.apply({ type: 'removeLayer', id: 'd2' });
      expect(selected.elementId).not.toBe('d2');

      history.undo();
      expect(selected.elementId).toBe('d2');

      history.redo();
      expect(selected.elementId).not.toBe('d2');
    });
  }
});

describe('dispose', () => {
  it('stops recording', () => {
    history.dispose();
    setWidth(20);

    expect(history.store.getState().canUndo).toBe(false);
  });
});

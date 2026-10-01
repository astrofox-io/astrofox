import { beforeEach, describe, expect, it, vi } from 'vitest';
import Display from '@/lib/core/Display';
import Effect from '@/lib/core/Effect';
import Reactors from '@/lib/core/Reactors';
import Stage from '@/lib/core/Stage';
import { createDocument, type ProjectDocument } from './document';
import { canReorder, layerKind, selectionAfterRemoval } from './selection';
import type { DocumentChange, LoadInput, SceneJSON } from './types';

class BoxDisplay extends Display {
  static config = {
    name: 'BoxDisplay',
    label: 'Box',
    type: 'display',
    defaultProperties: { width: 10, opacity: 1, src: '' },
  };

  constructor(properties?: Record<string, unknown>) {
    super(BoxDisplay, properties);
  }
}

class BlurEffect extends Effect {
  static config = {
    name: 'BlurEffect',
    label: 'Blur',
    type: 'effect',
    defaultProperties: { amount: 1 },
  };

  constructor(properties?: Record<string, unknown>) {
    super(BlurEffect, properties);
  }
}

const types: Record<string, new (properties?: Record<string, unknown>) => Display> = {
  BoxDisplay,
  BlurEffect,
};

let stage: Stage;
let reactors: Reactors;
let doc: ProjectDocument;
let changes: DocumentChange[];
const applyTimeline = vi.fn();

function layer(id: string, name: string, extra: Record<string, unknown> = {}) {
  return { id, name, displayName: id, properties: {}, ...extra };
}

const fixture: LoadInput = {
  canvas: { width: 640, height: 360, backgroundColor: '#000000' },
  name: 'Fixture',
  reactors: [{ id: 'r1', name: 'AudioReactor', displayName: 'Reactor 1', properties: {} }],
  scenes: [
    {
      ...layer('s1', 'Scene'),
      displays: [layer('d1', 'BoxDisplay'), layer('d2', 'BoxDisplay')],
      effects: [layer('e1', 'BlurEffect'), layer('e2', 'BlurEffect')],
    },
    {
      ...layer('s2', 'Scene'),
      displays: [layer('d3', 'BoxDisplay', { reactors: { width: { id: 'r1', min: 0, max: 5 } } })],
      effects: [],
    },
  ],
  unresolvedMediaRefs: [{ displayId: 'd1', kind: 'image', label: 'd1', sourcePath: 'C:\\a.png' }],
};

function ids(sceneId: string, kind: 'displays' | 'effects') {
  return doc.getState().sceneElementsById[sceneId][kind];
}

beforeEach(() => {
  stage = new Stage();
  reactors = new Reactors();
  applyTimeline.mockClear();
  doc = createDocument({
    stage,
    reactors,
    resolveType: name => types[name],
    applyCanvas: canvas => Object.assign(stage.properties, canvas),
    applyTimeline,
    requestRender: () => {},
    getProjectDuration: () => 30,
  });
  doc.load(fixture);
  changes = [];
  doc.subscribe(change => changes.push(change));
});

describe('load', () => {
  it('builds the live graph and publishes it', () => {
    const state = doc.getState();

    expect(state.sceneOrder).toEqual(['s1', 's2']);
    expect(ids('s1', 'displays')).toEqual(['d1', 'd2']);
    expect(state.canvas).toEqual({ width: 640, height: 360, backgroundColor: '#000000' });
    expect(state.name).toBe('Fixture');
    expect(doc.findLayer('d3')?.reactors.width).toEqual({ id: 'r1', min: 0, max: 5 });
    expect(doc.findReactor('r1')?.displayName).toBe('Reactor 1');
    expect(applyTimeline).toHaveBeenCalledWith({ duration: null, fps: 30 });
  });

  it('reports missing element types and plugins without failing', () => {
    const result = doc.load({
      scenes: [
        {
          ...layer('s1', 'Scene'),
          displays: [
            layer('x', 'GoneDisplay', { displayName: 'Old' }),
            layer('p', '@vendor/fancy', { plugin: { url: 'https://example.com/p' } }),
          ],
        },
      ],
    });

    expect(result.missing).toEqual(['Old (GoneDisplay)']);
    expect(result.missingPlugins).toEqual([
      { name: '@vendor/fancy', url: 'https://example.com/p' },
    ]);
    expect(ids('s1', 'displays')).toEqual([]);
  });

  it('round-trips its own snapshot', () => {
    const before = doc.snapshot();
    doc.load(before);

    expect(doc.snapshot()).toEqual(before);
  });

  it('is not an undoable change', () => {
    doc.load(fixture);

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ kind: 'load', record: false });
  });
});

describe('apply', () => {
  it('edits the live layer and publishes only what changed', () => {
    const before = doc.getState();
    const result = doc.apply({ type: 'setProperties', id: 'd1', properties: { width: 50 } });
    const after = doc.getState();

    expect(result.changed).toBe(true);
    expect(doc.findLayer('d1')?.authoredProperties.width).toBe(50);
    expect(after.elementById.d1.properties.width).toBe(50);
    expect(after.elementById.d2).toBe(before.elementById.d2);
    expect(after.sceneById.s2).toBe(before.sceneById.s2);
    expect(after.reactors).toBe(before.reactors);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ kind: 'change', record: true });
  });

  it('does nothing observable when the value is unchanged', () => {
    const before = doc.getState();
    const result = doc.apply({ type: 'setProperties', id: 'd1', properties: { width: 10 } });

    expect(result.changed).toBe(false);
    expect(doc.getState()).toBe(before);
    expect(changes).toHaveLength(0);
  });

  it('commits values a live preview already wrote to the layer', () => {
    // The transform overlay and camera orbit write to the live layer while dragging.
    doc.findLayer('d1')?.update({ width: 70 });
    const result = doc.apply({ type: 'setProperties', id: 'd1', properties: { width: 70 } });

    expect(result.changed).toBe(true);
    expect(doc.getState().elementById.d1.properties.width).toBe(70);
  });

  it('treats a list of ops as one change', () => {
    doc.apply([
      { type: 'setProperties', id: 'd1', properties: { width: 20 } },
      { type: 'setMeta', id: 'd1', displayName: 'Renamed', enabled: false },
      { type: 'setClip', id: 'd1', patch: { start: 2 } },
    ]);

    const d1 = doc.getState().elementById.d1;
    expect(changes).toHaveLength(1);
    expect(d1).toMatchObject({ displayName: 'Renamed', enabled: false });
    expect(d1.clip).toMatchObject({ start: 2 });
  });

  it('passes record: false through to listeners', () => {
    doc.apply({ type: 'setName', name: 'Saved As' }, { record: false });

    expect(changes[0]).toMatchObject({ kind: 'change', record: false });
    expect(doc.getState().name).toBe('Saved As');
  });

  it('ignores ops on missing layers', () => {
    expect(doc.apply({ type: 'setProperties', id: 'nope', properties: { width: 1 } })).toEqual({
      changed: false,
      id: undefined,
    });
  });

  it('adds scenes and elements and returns their ids', () => {
    const scene = doc.apply({ type: 'addScene', displayName: 'Third' });
    const element = doc.apply({
      type: 'addElement',
      element: new BoxDisplay(),
      sceneId: scene.id,
    });

    expect(doc.getState().sceneById[scene.id as string].displayName).toBe('Third');
    expect(ids(scene.id as string, 'displays')).toEqual([element.id]);
  });

  it('adds elements to the first scene when none is given', () => {
    const { id } = doc.apply({ type: 'addElement', element: new BlurEffect() });

    expect(ids('s1', 'effects')).toEqual(['e1', 'e2', id]);
  });

  it('removes a layer and forgets its unresolved media', () => {
    doc.apply({ type: 'removeLayer', id: 'd1' });

    expect(ids('s1', 'displays')).toEqual(['d2']);
    expect(doc.findLayer('d1')).toBeUndefined();
    expect(doc.getState().unresolvedMediaRefs).toEqual([]);
  });

  it('removes a scene with its elements', () => {
    doc.apply({ type: 'removeLayer', id: 's1' });

    expect(doc.getState().sceneOrder).toEqual(['s2']);
    expect(doc.getState().elementById.d1).toBeUndefined();
  });

  it('only binds to reactors that exist', () => {
    doc.apply({
      type: 'bindReactor',
      id: 'd1',
      property: 'width',
      reactorId: 'nope',
      min: 0,
      max: 1,
    });
    expect(doc.getState().elementById.d1.reactors).toEqual({});

    doc.apply({
      type: 'bindReactor',
      id: 'd1',
      property: 'width',
      reactorId: 'r1',
      min: 0,
      max: 1,
    });
    expect(doc.getState().elementById.d1.reactors.width).toEqual({ id: 'r1', min: 0, max: 1 });
  });

  it('unbinding returns the property to its authored value', () => {
    doc.apply({ type: 'unbindReactor', id: 'd3', property: 'width' });

    expect(doc.getState().elementById.d3.reactors).toEqual({});
    expect(doc.getState().elementById.d3.properties.width).toBe(10);
  });

  it('replaces bindings, dropping unknown reactors', () => {
    doc.apply({
      type: 'setBindings',
      id: 'd1',
      bindings: { width: { id: 'r1', min: 1, max: 2 }, opacity: { id: 'gone', min: 0, max: 1 } },
    });

    expect(doc.getState().elementById.d1.reactors).toEqual({ width: { id: 'r1', min: 1, max: 2 } });
  });

  it('removing a reactor removes every binding to it', () => {
    doc.apply({ type: 'removeReactor', id: 'r1' });

    expect(doc.getState().reactors).toEqual([]);
    expect(doc.getState().elementById.d3.reactors).toEqual({});
    expect(changes).toHaveLength(1);
  });

  it('adds reactors and edits them like layers', () => {
    const { id } = doc.apply({ type: 'addReactor' });
    doc.apply([
      { type: 'setProperties', id: id as string, properties: { maxDecibels: -10 } },
      { type: 'setMeta', id: id as string, displayName: 'Kick' },
    ]);

    const reactor = doc.getState().reactors.find(item => item.id === id);
    expect(reactor).toMatchObject({ displayName: 'Kick', properties: { maxDecibels: -10 } });
  });

  it('sets and clears clips', () => {
    doc.apply({ type: 'setClip', id: 'd2', patch: { start: 1, end: 4 } });
    expect(doc.getState().elementById.d2.clip).toMatchObject({ start: 1, end: 4 });

    doc.apply({ type: 'clearClip', id: 'd2' });
    expect(doc.getState().elementById.d2.clip).toBeUndefined();
  });

  it('checks a clip edit against the existing clip and the project end', () => {
    doc.apply({ type: 'setClip', id: 'd2', patch: { start: 4, end: 8 } });

    expect(() => doc.apply({ type: 'setClip', id: 'd2', patch: { end: 3 } })).toThrow(/later than/);
    // The fixture's project follows the audio, which the transport reports as 30s.
    expect(() => doc.apply({ type: 'setClip', id: 'd2', patch: { start: 30, end: null } })).toThrow(
      /project end/,
    );
    expect(doc.findLayer('d2')?.clip).toMatchObject({ start: 4, end: 8 });
  });

  it('keeps edited clips at least one frame long at the project fps', () => {
    // The fixture runs at 30 fps.
    expect(() => doc.apply({ type: 'setClip', id: 'd2', patch: { start: 4, end: 4.02 } })).toThrow(
      /one frame/,
    );
    expect(doc.findLayer('d2')?.clip).toBeNull();

    // An fps change earlier in the same batch applies to later clip edits.
    doc.apply([
      { type: 'setTimeline', fps: 60 },
      { type: 'setClip', id: 'd2', patch: { start: 4, end: 4.02 } },
    ]);
    expect(doc.findLayer('d2')?.clip).toMatchObject({ start: 4, end: 4.02 });
  });

  it('rejects a batch of clip edits as a whole', () => {
    expect(() =>
      doc.apply([
        { type: 'setClip', id: 'd1', patch: { start: 1, end: 2 } },
        { type: 'setClip', id: 'd2', patch: { start: 5, end: 5 } },
      ]),
    ).toThrow(/later than/);

    expect(doc.findLayer('d1')?.clip).toBeNull();
    expect(changes).toHaveLength(0);
  });

  it('checks later clip edits in a batch against earlier ones', () => {
    doc.apply([
      { type: 'setClip', id: 'd2', patch: { start: 4, end: 8 } },
      { type: 'setClip', id: 'd2', patch: { end: 6 } },
      { type: 'setTimeline', duration: 5 },
      { type: 'setClip', id: 'd1', patch: { start: 1 } },
    ]);
    expect(doc.findLayer('d2')?.clip).toMatchObject({ start: 4, end: 6 });

    expect(() =>
      doc.apply([
        { type: 'setTimeline', duration: 20 },
        { type: 'setClip', id: 'd1', patch: { start: 25 } },
      ]),
    ).toThrow(/project end \(20s\)/);
  });

  it('pushes canvas changes through the renderer seam', () => {
    doc.apply({ type: 'setCanvas', width: 1920, height: 1080 });

    expect(doc.getState().canvas).toEqual({
      width: 1920,
      height: 1080,
      backgroundColor: '#000000',
    });
  });

  it('validates and applies timeline settings', () => {
    doc.apply({ type: 'setTimeline', duration: 12, fps: 60 });

    expect(doc.getState().timeline).toEqual({ duration: 12, fps: 60 });
    expect(applyTimeline).toHaveBeenLastCalledWith({ duration: 12, fps: 60 });
    expect(() => doc.apply({ type: 'setTimeline', duration: 0 })).toThrow(/duration/);
    expect(() => doc.apply({ type: 'setTimeline', fps: 24 as 30 })).toThrow(/Frame rate/);
    expect(doc.getState().timeline).toEqual({ duration: 12, fps: 60 });
  });
});

describe('duplicateLayer', () => {
  it('copies an element right after the original with its missing media', () => {
    const { id } = doc.apply({ type: 'duplicateLayer', id: 'd1' });
    const copy = doc.getState().elementById[id as string];

    expect(ids('s1', 'displays')).toEqual(['d1', id, 'd2']);
    expect(copy).toMatchObject({ name: 'BoxDisplay', displayName: 'd1 (copy)' });
    expect(doc.getState().unresolvedMediaRefs.map(ref => ref.displayId)).toEqual(['d1', id]);
  });

  it('copies a scene with new ids for every element', () => {
    const { id } = doc.apply({ type: 'duplicateLayer', id: 's2' });
    const copy = doc.getState().sceneById[id as string] as SceneJSON;

    expect(doc.getState().sceneOrder).toEqual(['s1', 's2', id]);
    expect(copy.displays).toHaveLength(1);
    expect(copy.displays[0].id).not.toBe('d3');
    expect(copy.displays[0].reactors.width).toEqual({ id: 'r1', min: 0, max: 5 });
    expect(doc.findLayer(copy.displays[0].id)).toBeInstanceOf(BoxDisplay);
  });
});

describe('ordering', () => {
  it('moves a layer within its collection', () => {
    doc.apply({ type: 'moveLayer', id: 'd1', spaces: 1 });
    expect(ids('s1', 'displays')).toEqual(['d2', 'd1']);

    doc.apply({ type: 'moveLayer', id: 's2', spaces: -1 });
    expect(doc.getState().sceneOrder).toEqual(['s2', 's1']);
  });

  it('does not move past either end', () => {
    expect(doc.apply({ type: 'moveLayer', id: 'd2', spaces: 1 }).changed).toBe(false);
  });

  it('reorders within a scene', () => {
    doc.apply({ type: 'reorderLayer', sourceId: 'e2', targetId: 'e1' });

    expect(ids('s1', 'effects')).toEqual(['e2', 'e1']);
  });

  it('moves an element to another scene at the target position', () => {
    doc.apply({ type: 'reorderLayer', sourceId: 'd1', targetId: 'd3' });

    expect(ids('s1', 'displays')).toEqual(['d2']);
    expect(ids('s2', 'displays')).toEqual(['d1', 'd3']);
    expect(doc.findLayer('d1')?.scene).toBe(stage.getSceneById('s2'));
  });

  it('moves an element dropped on a scene row to the end of that scene', () => {
    doc.apply({ type: 'reorderLayer', sourceId: 'd1', targetId: 's2' });
    expect(ids('s2', 'displays')).toEqual(['d3', 'd1']);

    doc.apply({ type: 'reorderLayer', sourceId: 'e1', targetId: 's1' });
    expect(ids('s1', 'effects')).toEqual(['e2', 'e1']);
  });

  it('reorders scenes among scenes only', () => {
    doc.apply({ type: 'reorderLayer', sourceId: 's1', targetId: 's2' });
    expect(doc.getState().sceneOrder).toEqual(['s2', 's1']);

    expect(doc.apply({ type: 'reorderLayer', sourceId: 's1', targetId: 'd3' }).changed).toBe(false);
    expect(doc.apply({ type: 'reorderLayer', sourceId: 'd1', targetId: 'e1' }).changed).toBe(false);
  });
});

describe('selectionAfterRemoval', () => {
  function removeAndSelect(id: string) {
    const previous = doc.getState();
    doc.apply({ type: 'removeLayer', id });
    return selectionAfterRemoval(previous, doc.getState(), id);
  }

  it('selects the top element left in the scene', () => {
    expect(removeAndSelect('d2')).toBe('d1');
  });

  it('falls back to effects, then the scene', () => {
    expect(removeAndSelect('d3')).toBe('s2');
    doc.apply([
      { type: 'removeLayer', id: 'd1' },
      { type: 'removeLayer', id: 'd2' },
    ]);
    expect(removeAndSelect('e1')).toBe('e2');
  });

  it('selects the top scene when a scene goes', () => {
    expect(removeAndSelect('s2')).toBe('s1');
    expect(removeAndSelect('s1')).toBeNull();
  });
});

describe('canReorder', () => {
  const allowed = (sourceId: string, targetId: string) => {
    const state = doc.getState();
    return canReorder(id => layerKind(state, id), sourceId, targetId);
  };

  it('classifies layers by the list they are in', () => {
    const state = doc.getState();
    expect(['s1', 'd1', 'e1', 'nope'].map(id => layerKind(state, id))).toEqual([
      'scene',
      'display',
      'effect',
      null,
    ]);
  });

  it('allows the drops the Layers panel offers', () => {
    expect(allowed('s1', 's2')).toBe(true);
    expect(allowed('d1', 'd3')).toBe(true);
    expect(allowed('e1', 's2')).toBe(true);
    expect(allowed('s1', 'd1')).toBe(false);
    expect(allowed('d1', 'e1')).toBe(false);
    expect(allowed('d1', 'd1')).toBe(false);
    expect(allowed('d1', 'nope')).toBe(false);
  });

  it('allows a drop that changes nothing', () => {
    // d2 is already the last display in s1.
    expect(allowed('d2', 's1')).toBe(true);
    expect(doc.apply({ type: 'reorderLayer', sourceId: 'd2', targetId: 's1' }).changed).toBe(false);
  });
});

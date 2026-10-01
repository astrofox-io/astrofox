import { gzipSync } from 'node:zlib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Display from '@/lib/core/Display';
import Reactors from '@/lib/core/Reactors';
import Stage from '@/lib/core/Stage';
import { createDocument, type ProjectDocument } from '@/lib/document/document';
import { DEFAULT_PROJECT_NAME, type MediaRef } from '@/lib/document/types';
import {
  createProject,
  type Project,
  type ProjectFileOutput,
  type ProjectLibrary,
  type ProjectMedia,
} from './project';

function displayType(name: string) {
  const Type = class extends Display {
    static config = {
      name,
      label: name,
      type: 'display',
      defaultProperties: { width: 10, src: '' },
    };

    constructor(properties?: Record<string, unknown>) {
      super(Type, properties);
    }
  };
  return Type;
}

const types = Object.fromEntries(
  ['ImageDisplay', 'BarSpectrumDisplay', 'TextDisplay', 'BoxDisplay'].map(name => [
    name,
    displayType(name),
  ]),
);

const library: ProjectLibrary = { displays: types, effects: {} };

let doc: ProjectDocument;
let project: Project;
let zoom: number;
let unresolved: MediaRef[];
let savedMediaRefs: MediaRef[];
const rewind = vi.fn();

const media: ProjectMedia = {
  forSave: snapshot => ({ snapshot, mediaRefs: savedMediaRefs }),
  resolve: async snapshot => ({ snapshot, unresolvedMediaRefs: unresolved }),
};

function file(name: string, content: unknown) {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return new File([text], name);
}

const projectFile = {
  name: 'Saved Name',
  version: '2.0.0',
  snapshot: {
    stage: { properties: { width: 640, height: 360, backgroundColor: '#112233', zoom: 0.5 } },
    scenes: [
      {
        id: 's1',
        name: 'Scene',
        displayName: 'Scene 1',
        properties: {},
        displays: [{ id: 'd1', name: 'BoxDisplay', displayName: 'Box', properties: { width: 3 } }],
        effects: [],
      },
    ],
    reactors: [],
    timeline: { duration: 12, fps: 60 },
  },
  mediaRefs: [],
};

/** Saves to memory and returns what was written. */
async function saveToMemory(options?: { name?: string }) {
  let written: ProjectFileOutput | undefined;
  const result = await project.save(async output => {
    written = output;
    return 'saved';
  }, options);
  return { result, written: written as ProjectFileOutput };
}

function edit() {
  doc.apply({ type: 'setCanvas', width: 800 });
}

beforeEach(() => {
  zoom = 1;
  unresolved = [];
  savedMediaRefs = [];
  rewind.mockClear();
  const stage = new Stage();
  doc = createDocument({
    stage,
    reactors: new Reactors(),
    resolveType: name => types[name] as never,
    applyCanvas: canvas => Object.assign(stage.properties, canvas),
    applyTimeline: () => {},
    requestRender: () => {},
    getProjectDuration: () => 30,
  });
  project = createProject({
    document: doc,
    library: () => library,
    media,
    zoom: { get: () => zoom, set: value => (zoom = value) },
    rewind,
    appVersion: '9.9.9',
  });
  project.create();
});

describe('create', () => {
  it('starts with one scene holding the starter displays, unmodified and rewound', () => {
    const state = doc.getState();
    const [sceneId] = state.sceneOrder;

    expect(state.name).toBe(DEFAULT_PROJECT_NAME);
    expect(state.sceneElementsById[sceneId].displays.map(id => state.elementById[id].name)).toEqual(
      ['ImageDisplay', 'BarSpectrumDisplay', 'TextDisplay'],
    );
    expect(project.isModified()).toBe(false);
    expect(rewind).toHaveBeenCalledTimes(1);
  });
});

describe('isModified', () => {
  it('is set by a recorded edit', () => {
    edit();

    expect(project.isModified()).toBe(true);
  });

  it('is not set by an unrecorded change', () => {
    doc.apply({ type: 'setName', name: 'Renamed' }, { record: false });

    expect(project.isModified()).toBe(false);
  });

  it('is set when someone else replaces the document, such as undo', () => {
    doc.load(doc.snapshot());

    expect(project.isModified()).toBe(true);
  });

  it('is cleared by creating a new project', () => {
    edit();
    project.create();

    expect(project.isModified()).toBe(false);
  });
});

describe('open', () => {
  it('loads the file into the document, unmodified and rewound', async () => {
    edit();
    const result = await project.open(file('ignored.afx', projectFile));
    const state = doc.getState();

    expect(state.name).toBe('Saved Name');
    expect(state.canvas).toEqual({ width: 640, height: 360, backgroundColor: '#112233' });
    expect(state.elementById.d1.properties.width).toBe(3);
    expect(state.timeline).toEqual({ duration: 12, fps: 60 });
    expect(zoom).toBe(0.5);
    expect(rewind).toHaveBeenCalledTimes(2);
    expect(project.isModified()).toBe(false);
    expect(result).toEqual({ removed: [], missingPlugins: [], unresolvedMediaRefs: [] });
  });

  it('names the project after the file when the file has no name', async () => {
    await project.open(file('My Song.afx', { snapshot: projectFile.snapshot }));

    expect(doc.getState().name).toBe('My Song');
  });

  it('reports elements that no longer exist', async () => {
    const snapshot = structuredClone(projectFile.snapshot);
    snapshot.scenes[0].displays.push({
      id: 'd2',
      name: 'GoneDisplay',
      displayName: 'Gone',
      properties: { width: 1 },
    });

    const result = await project.open(file('a.afx', { snapshot }));

    expect(result.removed).toEqual([expect.stringContaining('GoneDisplay')]);
    expect(doc.getState().elementById.d2).toBeUndefined();
  });

  it('reports media that could not be found, and keeps it on the document', async () => {
    unresolved = [{ displayId: 'd1', kind: 'image', label: 'Box', sourcePath: 'C:\\a.png' }];

    const result = await project.open(file('a.afx', projectFile));

    expect(result.unresolvedMediaRefs).toEqual(unresolved);
    expect(doc.getState().unresolvedMediaRefs).toEqual(unresolved);
  });

  it('opens a gzip project from version 1', async () => {
    const gzip = gzipSync(Buffer.from(JSON.stringify(projectFile)));

    await project.open(new File([gzip], 'old.afx'));

    expect(doc.getState().name).toBe('Saved Name');
  });

  it('refuses a file without a project extension, leaving the document alone', async () => {
    edit();

    await expect(project.open(file('song.mp3', projectFile))).rejects.toThrow();
    expect(doc.getState().canvas.width).toBe(800);
    expect(project.isModified()).toBe(true);
  });

  it('refuses a file the validator rejects, before loading it', async () => {
    const validate = vi.fn(() => {
      throw new Error('bad project');
    });

    await expect(project.open(file('a.afx', projectFile), { validate })).rejects.toThrow(
      'bad project',
    );
    expect(validate).toHaveBeenCalledWith(expect.objectContaining({ scenes: expect.any(Array) }));
    expect(doc.getState().name).toBe(DEFAULT_PROJECT_NAME);
  });
});

describe('save', () => {
  it('writes a file that opens to the same document', async () => {
    await project.open(file('a.afx', projectFile));
    const before = doc.snapshot();
    zoom = 2;

    const { written } = await saveToMemory();
    project.create();
    await project.open(file(written.fileName, written.text));

    expect(written.fileName).toBe('Saved Name.afx');
    expect(written.mimeType).toBe('application/json');
    expect(doc.snapshot()).toEqual(before);
    expect(zoom).toBe(2);
  });

  it('writes the media references the media adapter gives it', async () => {
    savedMediaRefs = [{ displayId: 'd1', kind: 'image', label: 'Box', sourcePath: 'C:\\a.png' }];

    const { written } = await saveToMemory();

    expect(JSON.parse(written.text).mediaRefs).toEqual(savedMediaRefs);
  });

  it('clears modified, adopts the name and drops unresolved media once written', async () => {
    unresolved = [{ displayId: 'd1', kind: 'image', label: 'Box', sourcePath: 'C:\\a.png' }];
    await project.open(file('a.afx', projectFile));
    edit();

    const { result, written } = await saveToMemory({ name: '  New Name ' });

    expect(result).toBe('saved');
    expect(written.fileName).toBe('New Name.afx');
    expect(JSON.parse(written.text).name).toBe('New Name');
    expect(doc.getState().name).toBe('New Name');
    expect(doc.getState().unresolvedMediaRefs).toEqual([]);
    expect(project.isModified()).toBe(false);
  });

  it('adopting the name is not an undo step', async () => {
    const changes: boolean[] = [];
    doc.subscribe(change => changes.push(change.record));

    await saveToMemory({ name: 'Other' });

    expect(changes).toEqual([false]);
  });

  it('changes nothing when nothing was written', async () => {
    edit();

    const result = await project.save(async () => null, { name: 'Other' });

    expect(result).toBeNull();
    expect(doc.getState().name).toBe(DEFAULT_PROJECT_NAME);
    expect(project.isModified()).toBe(true);
  });

  it('stays modified when the document changes while the file is written', async () => {
    let text = '';
    await project.save(async output => {
      text = output.text;
      edit();
      return 'saved';
    });

    expect(JSON.parse(text).snapshot.stage.properties.width).not.toBe(800);
    expect(project.isModified()).toBe(true);
  });

  it('leaves the document unsaved when writing fails', async () => {
    edit();

    await expect(
      project.save(async () => {
        throw new Error('disk full');
      }),
    ).rejects.toThrow('disk full');
    expect(project.isModified()).toBe(true);
  });
});

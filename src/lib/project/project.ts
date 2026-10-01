import {
  type MigrationRegistry,
  migrateProjectSnapshot,
  type ProjectSnapshot,
} from '@/lib/core/migrateProject';
import type { ProjectDocument } from '@/lib/document/document';
import {
  type Canvas,
  DEFAULT_PROJECT_NAME,
  type DocumentChange,
  type LoadInput,
  type LoadResult,
  type MediaRef,
} from '@/lib/document/types';
import {
  PROJECT_FILE_MIME_TYPE,
  type ProjectFileInput,
  parseProjectFile,
  projectFileName,
  serializeProjectFile,
} from './projectFile';

export type { ProjectSnapshot };

type LayerType = (new (
  properties?: Record<string, unknown>,
) => unknown) &
  NonNullable<MigrationRegistry['displays']>[string];

/** The display and effect classes a project is built from, core and plugin. */
export interface ProjectLibrary {
  displays: Record<string, LayerType>;
  effects: Record<string, LayerType>;
}

/** How media sources are written to a project file and found again when it is opened. */
export interface ProjectMedia {
  /** The snapshot with media sources as they are saved, and a reference to each media file. */
  forSave(snapshot: ProjectSnapshot): { snapshot: ProjectSnapshot; mediaRefs: MediaRef[] };
  /** The snapshot with the media that could be found on this machine, and what could not. */
  resolve(
    snapshot: ProjectSnapshot,
    mediaRefs: unknown[],
  ): Promise<{ snapshot: ProjectSnapshot; unresolvedMediaRefs: MediaRef[] }>;
}

export interface ProjectDeps {
  document: ProjectDocument;
  /** Read when it is needed: plugins can add classes after the project is created. */
  library(): ProjectLibrary;
  media: ProjectMedia;
  /** The stage zoom. It is not Document content, but it is saved in the file. */
  zoom: { get(): number; set(zoom: number): void };
  /** Move the playhead to the start, for a project that was just opened or created. */
  rewind(): void;
  /** Written into saved files. */
  appVersion: string;
}

/** What opening a project could not bring back. */
export interface OpenResult {
  /** Elements dropped because they no longer exist or could not be migrated. */
  removed: string[];
  /** External plugins the project uses that are not installed. */
  missingPlugins: LoadResult['missingPlugins'];
  /** Media files that could not be found. */
  unresolvedMediaRefs: MediaRef[];
}

export interface OpenOptions {
  /** Checks the migrated snapshot before anything is loaded; throw to refuse the file. */
  validate?(snapshot: ProjectSnapshot): void;
}

/** A project file ready to be written. */
export interface ProjectFileOutput {
  text: string;
  /** The default file name for the project's name. */
  fileName: string;
  mimeType: string;
}

export interface SaveOptions {
  /** Save under this name and adopt it. Defaults to the project's name. */
  name?: string;
}

/**
 * The open project as a file: creating, opening and saving it, and whether it
 * has changes that are not saved. The Document is its content.
 */
export interface Project {
  /** Replace the document with the starting project. */
  create(): void;
  /** Open an .afx project file, or a .json or gzip file from an older version. */
  open(file: ProjectFileInput, options?: OpenOptions): Promise<OpenResult>;
  /**
   * Save the document as it is now. `write` puts the file somewhere and returns
   * `null` if nothing was written (a cancelled dialog). Once written, the
   * project adopts the saved name and is no longer modified, unless it was
   * changed while it was being written.
   */
  save<R>(
    write: (file: ProjectFileOutput) => Promise<R | null>,
    options?: SaveOptions,
  ): Promise<R | null>;
  /** Whether the document has changed since it was opened, created or saved. */
  isModified(): boolean;
  /** The document in project file format, without the media rewritten for saving. */
  toFile(): ProjectSnapshot;
}

/** The displays a new project starts with, back to front. */
const STARTER_DISPLAYS = ['ImageDisplay', 'BarSpectrumDisplay', 'TextDisplay'];

/** A migrated, media-resolved project file snapshot as Document input. */
function toLoadInput(
  snapshot: ProjectSnapshot,
  name: string,
  unresolvedMediaRefs: MediaRef[],
): LoadInput {
  const properties = (snapshot.stage?.properties ?? {}) as Partial<Canvas>;
  const canvas: Partial<Canvas> = {};

  for (const key of ['width', 'height', 'backgroundColor'] as const) {
    if (properties[key] !== undefined) {
      (canvas as Record<string, unknown>)[key] = properties[key];
    }
  }

  return {
    canvas,
    scenes: snapshot.scenes as LoadInput['scenes'],
    reactors: snapshot.reactors,
    timeline: snapshot.timeline,
    name,
    unresolvedMediaRefs,
  };
}

export function createProject(deps: ProjectDeps): Project {
  const { document } = deps;

  // Counts the changes that need saving: recorded edits, and loads the project
  // did not make itself (undo and redo).
  let revision = 0;
  let savedRevision = 0;

  document.subscribe((change: DocumentChange) => {
    if (change.record || change.kind === 'load') {
      revision += 1;
    }
  });

  function markSaved() {
    savedRevision = revision;
  }

  function toFile(): ProjectSnapshot {
    const { canvas, scenes, reactors, timeline } = document.snapshot();

    return {
      version: deps.appVersion,
      stage: { name: 'Stage', properties: { ...canvas, zoom: deps.zoom.get() } },
      scenes,
      reactors,
      timeline,
    };
  }

  function create() {
    const { displays } = deps.library();

    document.load({ name: DEFAULT_PROJECT_NAME });
    const { id: sceneId } = document.apply({ type: 'addScene' }, { record: false });
    document.apply(
      STARTER_DISPLAYS.map(name => ({
        type: 'addElement' as const,
        element: new displays[name](),
        sceneId,
      })),
      { record: false },
    );

    deps.rewind();
    markSaved();
  }

  async function open(file: ProjectFileInput, options: OpenOptions = {}): Promise<OpenResult> {
    const parsed = await parseProjectFile(file);
    const { displays, effects } = deps.library();
    const { snapshot: migrated, removed } = migrateProjectSnapshot(
      parsed.snapshot,
      parsed.version,
      { displays, effects },
    );
    options.validate?.(migrated);
    const { snapshot, unresolvedMediaRefs } = await deps.media.resolve(migrated, parsed.mediaRefs);

    const { missing, missingPlugins } = document.load(
      toLoadInput(snapshot, parsed.name, unresolvedMediaRefs),
    );

    const zoom = snapshot.stage?.properties?.zoom;
    if (typeof zoom === 'number') {
      deps.zoom.set(zoom);
    }

    deps.rewind();
    markSaved();

    return { removed: [...removed, ...missing], missingPlugins, unresolvedMediaRefs };
  }

  async function save<R>(
    write: (file: ProjectFileOutput) => Promise<R | null>,
    options: SaveOptions = {},
  ): Promise<R | null> {
    const name = (options.name || document.getState().name || DEFAULT_PROJECT_NAME).trim();
    // Taken before writing, so changes made meanwhile (in a save dialog) stay unsaved.
    const savingRevision = revision;
    const { snapshot, mediaRefs } = deps.media.forSave(toFile());
    const text = serializeProjectFile({ name, version: deps.appVersion, snapshot, mediaRefs });

    const result = await write({
      text,
      fileName: projectFileName(name),
      mimeType: PROJECT_FILE_MIME_TYPE,
    });

    if (result === null) {
      return null;
    }

    // Adopting the saved name is not an edit: no undo step, not modified.
    document.apply(
      [
        { type: 'setName', name },
        { type: 'setUnresolvedMediaRefs', refs: [] },
      ],
      { record: false },
    );

    if (revision === savingRevision) {
      markSaved();
    }

    return result;
  }

  return {
    create,
    open,
    save,
    isModified: () => revision !== savedRevision,
    toFile,
  };
}

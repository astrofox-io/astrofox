import { create } from 'zustand';
import { raiseError } from '@/app/actions/error';
import { showModal } from '@/app/actions/modals';
import stageStore, { setZoom } from '@/app/actions/stage';
import { BLANK_IMAGE } from '@/app/constants';
import { projectDocument } from '@/app/document';
import { api, env, library, logger } from '@/app/global';
import { t } from '@/i18n/config';
import type Entity from '@/lib/core/Entity';
import { type MigrationRegistry, migrateProjectSnapshot } from '@/lib/core/migrateProject';
import {
  type Canvas,
  DEFAULT_PROJECT_NAME,
  type DocumentChange,
  type LoadInput,
  type MediaKind,
  type MediaRef,
} from '@/lib/document/types';
import { seekTransport, type TimelineSettings } from '@/lib/timeline/transport';
import {
  getFileSystemPath,
  isLocalMediaUrl,
  localMediaUrlToPath,
  resolveVideoSourceUrl,
  toLocalMediaUrl,
} from '@/lib/utils/media';

export { DEFAULT_PROJECT_NAME, type MediaRef };

/** The project file's save state. Its content lives in `projectDocument`. */
interface ProjectState {
  opened: number;
  lastModified: number;
}

interface ElementSnapshot extends Record<string, unknown> {
  id: string;
  name?: string;
  displayName?: string;
  properties?: Record<string, unknown>;
}

interface SceneSnapshot extends Record<string, unknown> {
  displays?: ElementSnapshot[];
  effects?: ElementSnapshot[];
}

interface ProjectSnapshot extends Record<string, unknown> {
  stage?: { name?: string; properties?: Record<string, unknown> };
  scenes?: SceneSnapshot[];
  reactors?: Record<string, unknown>[];
  /** Absent in projects saved before the timeline existed: duration follows the audio. */
  timeline?: TimelineSettings;
}

interface ProjectFilePayload extends Record<string, unknown> {
  snapshot?: ProjectSnapshot;
  snapshotJson?: ProjectSnapshot;
  project?: {
    snapshot?: ProjectSnapshot;
    snapshotJson?: ProjectSnapshot;
    name?: string;
    mediaRefs?: MediaRef[];
  };
  projectName?: string;
  name?: string;
  mediaRefs?: MediaRef[];
}

type MediaRefInput = Partial<MediaRef> & {
  path?: string;
};

type LibraryConstructor = new (properties?: Record<string, unknown>) => Entity;

/** Canonical project file extension */
const PROJECT_FILE_EXTENSION = 'afx';
/** Accepted on open only, for projects saved by older versions */
const PROJECT_LEGACY_OPEN_EXTENSION = 'json';
const PROJECT_OPEN_EXTENSIONS = [PROJECT_FILE_EXTENSION, PROJECT_LEGACY_OPEN_EXTENSION];
const PROJECT_SAVE_EXTENSIONS = [PROJECT_FILE_EXTENSION];
const PROJECT_FILE_MIME_TYPE = 'application/json';
const GZIP_MAGIC_0 = 0x1f;
const GZIP_MAGIC_1 = 0x8b;

function getProjectOpenFilters() {
  return [
    {
      name: t('file-types.astrofox-project'),
      extensions: PROJECT_OPEN_EXTENSIONS,
      mimeType: PROJECT_FILE_MIME_TYPE,
    },
  ];
}

function getProjectSaveFilters() {
  return [
    {
      name: t('file-types.astrofox-project'),
      extensions: PROJECT_SAVE_EXTENSIONS,
      mimeType: PROJECT_FILE_MIME_TYPE,
    },
  ];
}

function isGzipBytes(bytes: Uint8Array) {
  return bytes.length >= 2 && bytes[0] === GZIP_MAGIC_0 && bytes[1] === GZIP_MAGIC_1;
}

async function gunzipToText(bytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error(t('errors.gzip-decompress-unsupported'));
  }

  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();
  return new TextDecoder('utf-8').decode(buffer);
}

/**
 * Read a project file as JSON text.
 * - plain text: decode as UTF-8 (canonical format)
 * - gzip magic bytes: inflate gzip then decode (legacy v1 format)
 */
async function readProjectFileText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (isGzipBytes(bytes)) {
    return gunzipToText(bytes);
  }

  return new TextDecoder('utf-8').decode(bytes);
}

function isSupportedProjectFileName(fileName = '') {
  return /\.(afx|json)$/i.test(fileName);
}

const initialState: ProjectState = {
  opened: 0,
  lastModified: 0,
};

const projectStore = create<ProjectState>(() => ({
  ...initialState,
}));

/** The document in project file format. */
export function snapshotProject(): ProjectSnapshot {
  const { canvas, scenes, reactors, timeline } = projectDocument.snapshot();

  return {
    version: env.APP_VERSION,
    stage: { name: 'Stage', properties: { ...canvas, zoom: stageStore.getState().zoom } },
    scenes,
    reactors,
    timeline,
  };
}

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

function isEmbeddedMediaSource(src: string) {
  return /^data:(image|video)\//i.test(src);
}

function isRemoteMediaSource(src: string) {
  return /^(https?:)?\/\//i.test(src);
}

function isBlobMediaSource(src: string) {
  return /^blob:/i.test(src);
}

function isFileUrlSource(src: string) {
  return /^file:\/\//i.test(src);
}

function isWindowsPathSource(src: string) {
  return /^[a-zA-Z]:[\\/]/.test(src);
}

function isUncPathSource(src: string) {
  return /^\\\\/.test(src);
}

function normalizeMediaPath(path: unknown): string {
  if (typeof path !== 'string') {
    return '';
  }

  return path.trim();
}

function fileUrlToPath(src: string): string {
  if (!isFileUrlSource(src)) {
    return '';
  }

  try {
    const url = new URL(src);
    let path = decodeURIComponent(url.pathname || '');

    if (/^\/[a-zA-Z]:/.test(path)) {
      path = path.slice(1);
    }

    if (url.host) {
      return `\\\\${url.host}${path.replace(/\//g, '\\')}`;
    }

    if (/^[a-zA-Z]:/.test(path)) {
      return path.replace(/\//g, '\\');
    }

    return path;
  } catch {
    const rawPath = decodeURIComponent(src.replace(/^file:\/\//i, ''));
    return rawPath.replace(/^\/[a-zA-Z]:/, match => match.slice(1));
  }
}

function getMediaSourcePath(src: unknown): string {
  if (typeof src !== 'string') {
    return '';
  }

  if (isLocalMediaUrl(src)) {
    return normalizeMediaPath(localMediaUrlToPath(src));
  }

  if (isFileUrlSource(src)) {
    return normalizeMediaPath(fileUrlToPath(src));
  }

  if (isWindowsPathSource(src) || isUncPathSource(src)) {
    return normalizeMediaPath(src);
  }

  return '';
}

// Media displays declare `media: 'image' | 'video'` on their config.
function getMediaKind(element: Pick<ElementSnapshot, 'name'> | null | undefined): MediaKind {
  const displays = (library.get('displays') ?? {}) as Record<
    string,
    { config?: { media?: string } }
  >;
  return displays[element?.name ?? '']?.config?.media === 'video' ? 'video' : 'image';
}

function getMediaLabel(
  element: Pick<ElementSnapshot, 'displayName' | 'name'> | null | undefined,
): string {
  return element?.displayName || element?.name || t('relink-media.media');
}

function buildMediaRef(
  element: Pick<ElementSnapshot, 'id' | 'name' | 'displayName'>,
  sourcePath = '',
): MediaRef {
  return {
    displayId: element.id,
    kind: getMediaKind(element),
    label: getMediaLabel(element),
    sourcePath,
  };
}

function normalizeMediaRef(mediaRef: MediaRefInput | null | undefined): MediaRef | null {
  if (!mediaRef || typeof mediaRef !== 'object' || !mediaRef.displayId) {
    return null;
  }

  return {
    displayId: mediaRef.displayId,
    kind: mediaRef.kind === 'video' ? 'video' : 'image',
    label: mediaRef.label || t('relink-media.media'),
    sourcePath: normalizeMediaPath(mediaRef.sourcePath) || normalizeMediaPath(mediaRef.path) || '',
  };
}

function mergeMediaRefs(...groups: Array<MediaRefInput[] | null | undefined>): MediaRef[] {
  const byDisplayId = new Map<string, MediaRef>();

  for (const group of groups) {
    for (const mediaRef of group || []) {
      const normalized = normalizeMediaRef(mediaRef);
      if (!normalized) {
        continue;
      }

      const previous = byDisplayId.get(normalized.displayId);

      byDisplayId.set(normalized.displayId, {
        ...(previous || {}),
        ...normalized,
        sourcePath: normalized.sourcePath || previous?.sourcePath || '',
      });
    }
  }

  return Array.from(byDisplayId.values());
}

async function canLoadMediaSource(src: string, kind: MediaKind): Promise<boolean> {
  if (!src) {
    return false;
  }

  return new Promise<boolean>(resolve => {
    let settled = false;

    function done(result: boolean) {
      if (settled) {
        return;
      }

      settled = true;
      resolve(result);
    }

    const timeoutId = window.setTimeout(() => done(false), 2000);

    if (kind === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.clearTimeout(timeoutId);
        video.removeAttribute('src');
        video.load();
        done(true);
      };

      video.onerror = () => {
        window.clearTimeout(timeoutId);
        video.removeAttribute('src');
        video.load();
        done(false);
      };

      video.src = src;
      return;
    }

    const image = new Image();

    image.onload = () => {
      window.clearTimeout(timeoutId);
      done(true);
    };

    image.onerror = () => {
      window.clearTimeout(timeoutId);
      done(false);
    };

    image.src = src;
  });
}

function prepareSnapshotMediaForSave(snapshot: ProjectSnapshot) {
  const mediaRefs: MediaRef[] = [];

  const scenes = (snapshot?.scenes || []).map((scene: SceneSnapshot) => {
    const mapMediaProps = (element: ElementSnapshot) => {
      const src = element?.properties?.src;
      const sourcePath = normalizeMediaPath(element?.properties?.sourcePath);
      const kind = getMediaKind(element);

      if (sourcePath) {
        mediaRefs.push(buildMediaRef(element, sourcePath));

        if (!src || src === BLANK_IMAGE || typeof src !== 'string') {
          return {
            ...element,
            properties: {
              ...element.properties,
              sourcePath,
            },
          };
        }

        if (kind === 'image' && (isEmbeddedMediaSource(src) || isRemoteMediaSource(src))) {
          return {
            ...element,
            properties: {
              ...element.properties,
              sourcePath,
            },
          };
        }

        return {
          ...element,
          properties: {
            ...element.properties,
            src: kind === 'image' ? BLANK_IMAGE : toLocalMediaUrl(sourcePath),
            sourcePath,
          },
        };
      }

      if (!src || src === BLANK_IMAGE || typeof src !== 'string') {
        return element;
      }

      const inferredSourcePath = getMediaSourcePath(src);

      if (inferredSourcePath) {
        mediaRefs.push(buildMediaRef(element, inferredSourcePath));

        return {
          ...element,
          properties: {
            ...element.properties,
            src:
              getMediaKind(element) === 'image' ? BLANK_IMAGE : toLocalMediaUrl(inferredSourcePath),
            sourcePath: inferredSourcePath,
          },
        };
      }

      if (isBlobMediaSource(src)) {
        mediaRefs.push(buildMediaRef(element));

        return {
          ...element,
          properties: {
            ...element.properties,
            src: BLANK_IMAGE,
            sourcePath: '',
          },
        };
      }

      if (isEmbeddedMediaSource(src) || isRemoteMediaSource(src)) {
        return element;
      }

      return element;
    };

    return {
      ...scene,
      displays: (scene.displays || []).map(mapMediaProps),
      effects: (scene.effects || []).map(mapMediaProps),
    };
  });

  return {
    snapshot: {
      ...snapshot,
      scenes,
    },
    mediaRefs,
  };
}

async function resolveSnapshotMediaOnLoad(
  snapshot: ProjectSnapshot,
  payloadMediaRefs: MediaRefInput[] = [],
): Promise<{
  snapshot: ProjectSnapshot;
  unresolvedMediaRefs: MediaRef[];
}> {
  const mediaRefMap = new Map<string, MediaRef>();

  for (const mediaRef of payloadMediaRefs || []) {
    const normalized = normalizeMediaRef(mediaRef);

    if (normalized) {
      mediaRefMap.set(normalized.displayId, normalized);
    }
  }

  const unresolvedMediaRefs: MediaRef[] = [];

  const scenes = await Promise.all(
    (snapshot?.scenes || []).map(async (scene: SceneSnapshot) => {
      const mapMediaProps = async (element: ElementSnapshot) => {
        const src = element?.properties?.src;
        const kind = getMediaKind(element);

        const mediaRef = mediaRefMap.get(element.id);
        const sourcePath =
          normalizeMediaPath(element?.properties?.sourcePath) ||
          normalizeMediaPath(mediaRef?.sourcePath) ||
          getMediaSourcePath(src);

        if (
          kind === 'image' &&
          typeof src === 'string' &&
          (isEmbeddedMediaSource(src) || isRemoteMediaSource(src))
        ) {
          return {
            ...element,
            properties: {
              ...element.properties,
              sourcePath,
            },
          };
        }

        if (sourcePath) {
          if (kind === 'video') {
            const sourceUrl = toLocalMediaUrl(sourcePath);
            const canLoad = await canLoadMediaSource(sourceUrl, kind);

            if (canLoad) {
              return {
                ...element,
                properties: {
                  ...element.properties,
                  src: sourceUrl,
                  sourcePath,
                },
              };
            }

            if (
              typeof src === 'string' &&
              (isEmbeddedMediaSource(src) || isRemoteMediaSource(src))
            ) {
              return {
                ...element,
                properties: {
                  ...element.properties,
                  sourcePath: '',
                },
              };
            }
          }

          unresolvedMediaRefs.push(buildMediaRef(element, sourcePath));

          return {
            ...element,
            properties: {
              ...element.properties,
              src: BLANK_IMAGE,
              sourcePath,
            },
          };
        }

        if (!src || src === BLANK_IMAGE || typeof src !== 'string') {
          return element;
        }

        if (isBlobMediaSource(src)) {
          unresolvedMediaRefs.push(buildMediaRef(element));

          return {
            ...element,
            properties: {
              ...element.properties,
              src: BLANK_IMAGE,
              sourcePath: '',
            },
          };
        }

        return element;
      };

      return {
        ...scene,
        displays: await Promise.all((scene.displays || []).map(mapMediaProps)),
        effects: await Promise.all((scene.effects || []).map(mapMediaProps)),
      };
    }),
  );

  return {
    snapshot: {
      ...snapshot,
      scenes,
    },
    unresolvedMediaRefs,
  };
}

function sanitizeFileName(name?: string) {
  return (name || '')
    .trim()
    .replace(/[<>:"/\\|?*]/g, '-')
    .split('')
    .map(character => (character.charCodeAt(0) <= 0x1f ? '-' : character))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function createProjectFileName(name?: string) {
  const safeName = sanitizeFileName(name) || DEFAULT_PROJECT_NAME;
  return `${safeName}.${PROJECT_FILE_EXTENSION}`;
}

function parseProjectNameFromFile(fileName = '') {
  return fileName.replace(/\.(afx|json)$/i, '').trim() || DEFAULT_PROJECT_NAME;
}

function parseProjectPayload(payload: unknown, fallbackName?: string) {
  if (!payload || typeof payload !== 'object') {
    throw new Error(t('errors.invalid-project-file'));
  }

  const data = payload as ProjectFilePayload;

  const snapshot =
    data.snapshot ||
    data.snapshotJson ||
    data.project?.snapshot ||
    data.project?.snapshotJson ||
    data;

  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error(t('errors.invalid-project-snapshot'));
  }

  return {
    snapshot,
    projectName:
      data.projectName || data.name || data.project?.name || fallbackName || DEFAULT_PROJECT_NAME,
    mediaRefs: data.mediaRefs || data.project?.mediaRefs || [],
  };
}

function getMigrationRegistry(): MigrationRegistry {
  return {
    displays: library.get('displays') as MigrationRegistry['displays'],
    effects: library.get('effects') as MigrationRegistry['effects'],
  };
}

function notifyRemovedElements(removed: string[]) {
  if (removed.length === 0) {
    return;
  }

  const unique = [...new Set(removed)];
  const message = t('errors.project-elements-removed', {
    count: unique.length,
    defaultValue:
      'This project was created with an older version of Astrofox. Some elements could not be converted and were removed.',
  });

  raiseError(message, unique.join('\n'), { logLevel: 'warn' });
}

async function loadProjectFromPayload(
  payload: unknown,
  fallbackName?: string,
  options: { interactive?: boolean; validate?: (snapshot: ProjectSnapshot) => void } = {},
) {
  const { snapshot, projectName, mediaRefs } = parseProjectPayload(payload, fallbackName);
  const version =
    (payload as ProjectFilePayload).version ?? (snapshot as { version?: unknown }).version;
  const { snapshot: migratedSnapshot, removed } = migrateProjectSnapshot(
    snapshot,
    typeof version === 'string' ? version : undefined,
    getMigrationRegistry(),
  );
  options.validate?.(migratedSnapshot);
  const { snapshot: resolvedSnapshot, unresolvedMediaRefs: detectedMissingMedia } =
    await resolveSnapshotMediaOnLoad(migratedSnapshot, mediaRefs);
  const unresolvedMediaRefs = mergeMediaRefs(detectedMissingMedia);

  const interactive = options.interactive !== false;
  const { missing, missingPlugins } = projectDocument.load(
    toLoadInput(resolvedSnapshot, projectName || DEFAULT_PROJECT_NAME, unresolvedMediaRefs),
  );
  logger.log('Loaded project:', resolvedSnapshot);

  for (const name of [...missing, ...missingPlugins.map(plugin => plugin.name)]) {
    logger.warn('Component not found:', name);
  }

  const zoom = resolvedSnapshot.stage?.properties?.zoom;
  if (typeof zoom === 'number') {
    setZoom(zoom);
  }

  seekTransport(0);

  if (interactive) {
    notifyRemovedElements([...removed, ...missing]);

    if (missingPlugins.length > 0) {
      showModal('MissingPlugins', { title: 'Missing Plugins' }, { missing: missingPlugins });
    }
  }

  projectStore.setState({ opened: Date.now(), lastModified: 0 });

  if (unresolvedMediaRefs.length > 0 && options.interactive !== false) {
    const count = unresolvedMediaRefs.length;
    openRelinkMediaDialog({
      titleKey: 'relink-media.missing-title',
      titleOptions: { count },
    });
  }
  return { removed: [...removed, ...missing], missingPlugins, unresolvedMediaRefs };
}

/** Dialog-free file loading shares migration and media resolution with the UI. */
export async function openProjectData(file: File, validate: (snapshot: ProjectSnapshot) => void) {
  if (!isSupportedProjectFileName(file.name)) throw new Error('Expected an .afx or .json project.');
  const payload = JSON.parse(await readProjectFileText(file));
  return loadProjectFromPayload(payload, parseProjectNameFromFile(file.name), {
    interactive: false,
    validate,
  });
}

/** The project file's text, as saved from the UI and by automation. */
export function serializeProjectFile(name = projectDocument.getState().name) {
  const { snapshot, mediaRefs } = prepareSnapshotMediaForSave(snapshotProject());
  return JSON.stringify(
    {
      name,
      projectName: name,
      version: env.APP_VERSION,
      savedAt: new Date().toISOString(),
      snapshot,
      mediaRefs,
    },
    null,
    2,
  );
}

export function markProjectSaved(lastModified: number) {
  if (projectStore.getState().lastModified === lastModified) {
    projectStore.setState({ opened: Date.now(), lastModified: 0 });
  }
}

export function touchProject() {
  projectStore.setState({ lastModified: Date.now() });
}

/** Mark the project modified whenever the document records a change. */
export function trackProjectChanges() {
  return projectDocument.subscribe((change: DocumentChange) => {
    if (change.record) {
      touchProject();
    }
  });
}

/** Replace the document with the default starting project. */
export function newProject() {
  projectDocument.load({ name: DEFAULT_PROJECT_NAME });

  const displays = library.get('displays') as Record<string, LibraryConstructor>;
  const { id: sceneId } = projectDocument.apply({ type: 'addScene' }, { record: false });

  projectDocument.apply(
    [displays.ImageDisplay, displays.BarSpectrumDisplay, displays.TextDisplay].map(Type => ({
      type: 'addElement' as const,
      element: new Type(),
      sceneId,
    })),
    { record: false },
  );

  seekTransport(0);
  projectStore.setState({ opened: Date.now(), lastModified: 0 });
}

export function checkUnsavedChanges(menuAction: string, action: () => unknown) {
  const { opened, lastModified } = projectStore.getState();

  if (lastModified > opened) {
    showModal('UnsavedChangesDialog', { showCloseButton: false }, { action: menuAction });
  } else {
    action();
  }
}

export async function openProjectFile() {
  try {
    const { files, canceled } = await api.showOpenDialog({
      filters: getProjectOpenFilters(),
    });

    if (canceled || !files || !files.length) {
      return false;
    }

    const file = files[0];
    if (!isSupportedProjectFileName(file.name || '')) {
      throw new Error(t('errors.project-file-extension-required'));
    }

    const text = await readProjectFileText(file);
    const payload = JSON.parse(text);
    const fallbackName = parseProjectNameFromFile(file.name);

    await loadProjectFromPayload(payload, fallbackName);
    return true;
  } catch (error) {
    raiseError(t('errors.open-project-file-failed'), error);
    return false;
  }
}

export function openRelinkMediaDialog(modalProps: Record<string, unknown> = {}) {
  showModal('RelinkMediaDialog', {
    titleKey: 'relink-media.title',
    ...modalProps,
  });
}

export async function saveProject(nameOverride?: string) {
  const name = (nameOverride || projectDocument.getState().name || DEFAULT_PROJECT_NAME).trim();

  try {
    // Captured before the dialog opens, so edits made meanwhile are not saved.
    const json = serializeProjectFile(name);
    const fileName = createProjectFileName(name);
    const { fileHandle, filePath, canceled } = await api.showSaveDialog({
      defaultPath: fileName,
      filters: getProjectSaveFilters(),
    });

    if (canceled) {
      return false;
    }

    const target = fileHandle || filePath || fileName;
    const targetName =
      (typeof filePath === 'string' && filePath) ||
      (fileHandle as { name?: string } | undefined)?.name ||
      fileName;

    await api.saveTextFile(target, json, {
      mimeType: PROJECT_FILE_MIME_TYPE,
      fileName: targetName,
    });

    // Adopting the saved name is not an edit: no undo step, not modified.
    projectDocument.apply(
      [
        { type: 'setName', name },
        { type: 'setUnresolvedMediaRefs', refs: [] },
      ],
      { record: false },
    );
    projectStore.setState({ opened: Date.now(), lastModified: 0 });

    logger.log('Project saved locally:', fileName);
    return true;
  } catch (error) {
    raiseError(t('errors.save-project-file-failed'), error);
    return false;
  }
}

export async function relinkMediaRef(mediaRef: MediaRef) {
  try {
    const isVideo = mediaRef.kind === 'video';
    const filters = isVideo
      ? [{ name: t('file-types.video-files'), extensions: ['mp4', 'webm', 'ogv'] }]
      : [{ name: t('file-types.image-files'), extensions: ['jpg', 'jpeg', 'png', 'gif'] }];
    const { files, canceled } = await api.showOpenDialog({ filters });

    if (canceled || !files || !files.length) {
      return;
    }

    const file = files[0];
    const sourcePath = getFileSystemPath(file);
    const src = isVideo ? resolveVideoSourceUrl(file, sourcePath) : await api.readImageFile(file);

    projectDocument.apply([
      {
        type: 'setProperties',
        id: mediaRef.displayId,
        properties: { src, sourcePath: sourcePath || '' },
      },
      {
        type: 'setUnresolvedMediaRefs',
        refs: projectDocument
          .getState()
          .unresolvedMediaRefs.filter(ref => ref.displayId !== mediaRef.displayId),
      },
    ]);
  } catch (error) {
    raiseError(t('errors.relink-media-failed'), error);
  }
}

export function clearUnresolvedMedia() {
  projectDocument.apply({ type: 'setUnresolvedMediaRefs', refs: [] });
}

export default projectStore;

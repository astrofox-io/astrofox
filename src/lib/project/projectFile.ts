import { t } from '@/i18n/config';
import type { ProjectSnapshot } from '@/lib/core/migrateProject';
import { DEFAULT_PROJECT_NAME, type MediaRef } from '@/lib/document/types';

/** Canonical project file extension. */
export const PROJECT_FILE_EXTENSION = 'afx';
/** Accepted on open only, for projects saved by older versions. */
const PROJECT_LEGACY_OPEN_EXTENSION = 'json';
export const PROJECT_OPEN_EXTENSIONS = [PROJECT_FILE_EXTENSION, PROJECT_LEGACY_OPEN_EXTENSION];
export const PROJECT_SAVE_EXTENSIONS = [PROJECT_FILE_EXTENSION];
export const PROJECT_FILE_MIME_TYPE = 'application/json';

const GZIP_MAGIC_0 = 0x1f;
const GZIP_MAGIC_1 = 0x8b;

/** A project file to open: a browser `File`, or anything read like one. */
export interface ProjectFileInput {
  name: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

/** What `parseProjectFile` finds in a project file's JSON. */
export interface ParsedProjectFile {
  snapshot: ProjectSnapshot;
  name: string;
  /** References to media saved outside the file. */
  mediaRefs: unknown[];
  /** The app version that saved it, when the file says. */
  version?: string;
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
  version?: unknown;
}

export function isProjectFileName(fileName = '') {
  return /\.(afx|json)$/i.test(fileName);
}

function nameFromFileName(fileName = '') {
  return fileName.replace(/\.(afx|json)$/i, '').trim() || DEFAULT_PROJECT_NAME;
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

/** The file name a project is saved under by default. */
export function projectFileName(name?: string) {
  const safeName = sanitizeFileName(name) || DEFAULT_PROJECT_NAME;
  return `${safeName}.${PROJECT_FILE_EXTENSION}`;
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
 * Read and parse a project file.
 * - plain UTF-8 JSON: the current format
 * - gzip: the v1 format
 * - the snapshot at the top level or nested under `snapshot`/`project`: older layouts
 */
export async function parseProjectFile(file: ProjectFileInput): Promise<ParsedProjectFile> {
  if (!isProjectFileName(file.name)) {
    throw new Error(t('errors.project-file-extension-required'));
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const text = isGzipBytes(bytes)
    ? await gunzipToText(bytes)
    : new TextDecoder('utf-8').decode(bytes);
  const payload: unknown = JSON.parse(text);

  if (!payload || typeof payload !== 'object') {
    throw new Error(t('errors.invalid-project-file'));
  }

  const data = payload as ProjectFilePayload;
  // Files from before the payload had a `snapshot` key are the snapshot itself.
  const snapshot = (data.snapshot ||
    data.snapshotJson ||
    data.project?.snapshot ||
    data.project?.snapshotJson ||
    data) as ProjectSnapshot;

  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error(t('errors.invalid-project-snapshot'));
  }

  const version = data.version ?? snapshot.version;

  return {
    snapshot,
    name: data.projectName || data.name || data.project?.name || nameFromFileName(file.name),
    mediaRefs: data.mediaRefs || data.project?.mediaRefs || [],
    version: typeof version === 'string' ? version : undefined,
  };
}

/** A project file's text. */
export function serializeProjectFile(input: {
  name: string;
  version: string;
  snapshot: ProjectSnapshot;
  mediaRefs: MediaRef[];
}) {
  const { name, version, snapshot, mediaRefs } = input;

  return JSON.stringify(
    {
      name,
      projectName: name,
      version,
      savedAt: new Date().toISOString(),
      snapshot,
      mediaRefs,
    },
    null,
    2,
  );
}

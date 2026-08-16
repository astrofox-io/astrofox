import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { getDesktopBridge } from '@/app/desktop';
import env from '@/app/env';
import { t } from '@/i18n/config';
import EventEmitter from '@/lib/core/EventEmitter';
import type { EventCallback } from '@/lib/types';

const events = new EventEmitter();

interface FileFilter {
  name?: string;
  mimeType?: string;
  extensions?: string[];
}

interface PickerType {
  description: string;
  accept: Record<string, string[]>;
}

/**
 * File pickers default to web File System Access APIs (same on web and desktop).
 * Set `preferNativePath` only when a real OS path is required (e.g. ffmpeg output).
 */
interface OpenDialogProps {
  filters?: FileFilter[];
  multiple?: boolean;
  /** Use the Electron dialog + filesystem path (needed for ffmpeg / media protocol). */
  preferNativePath?: boolean;
}

interface SaveDialogProps {
  filters?: FileFilter[];
  defaultPath?: string;
  /** Use the Electron dialog + absolute path (needed for ffmpeg output). */
  preferNativePath?: boolean;
}

interface SaveFileProps {
  mimeType?: string;
  fileName?: string;
}

interface FileHandle {
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (blob: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
  name: string;
}

export type OpenDialogResult = {
  canceled: boolean;
  files: File[];
  fileHandles?: FileHandle[];
  filePaths?: string[];
};

export type SaveDialogResult = {
  canceled: boolean;
  fileHandle?: FileHandle;
  filePath?: string;
};

const FILE_MIME_TYPES: Record<string, string> = {
  aac: 'audio/aac',
  flac: 'audio/flac',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  ogg: 'audio/ogg',
  ogv: 'video/ogg',
  opus: 'audio/ogg',
  png: 'image/png',
  wav: 'audio/wav',
  webm: 'video/webm',
};

function getFileMimeType(fileName: string, filters: FileFilter[] = []) {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const filter = filters.find(item =>
    (item.extensions || []).some(candidate => candidate.toLowerCase() === extension),
  );

  return filter?.mimeType || FILE_MIME_TYPES[extension] || '';
}

function buildPickerTypes(filters: FileFilter[] = []): PickerType[] | undefined {
  if (!filters.length) return undefined;

  return filters.map(filter => ({
    description: filter.name || t('file-types.files'),
    accept: {
      [filter.mimeType || 'application/octet-stream']: (filter.extensions || []).map(
        (ext: string) => `.${ext}`,
      ),
    },
  }));
}

async function toFile(input: File | FileHandle | null): Promise<File | null> {
  if (!input) return null;

  const file = input instanceof File ? input : 'getFile' in input ? await input.getFile() : null;
  if (!file || file.type) return file;

  const inferredType = getFileMimeType(file.name);
  if (!inferredType) return file;

  return new File([file], file.name, {
    type: inferredType,
    lastModified: file.lastModified,
  });
}

function isAbsoluteFilePath(value: string) {
  // Windows drive (C:\ or C:/), UNC (\\server), or POSIX (/) paths.
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\') || value.startsWith('/');
}

function mapDesktopOpenFilters(filters: FileFilter[] = []) {
  return filters.map(filter => ({
    name: filter.name || t('file-types.files'),
    extensions: filter.extensions || ['*'],
  }));
}

function mapDesktopSaveFilters(filters: FileFilter[] = []) {
  return filters.map(filter => ({
    name: filter.name || t('file-types.files'),
    extensions: filter.extensions || ['*'],
  }));
}

/**
 * Native open: dialog returns paths; load bytes over IPC and attach `.path` for
 * callers that need a real filesystem location (ffmpeg, optional media streaming).
 */
async function showNativeOpenDialog(props: OpenDialogProps): Promise<OpenDialogResult> {
  const desktop = getDesktopBridge();
  if (!desktop?.showOpenDialog || !desktop.readFile) {
    throw new Error(t('errors.native-file-dialog-unavailable'));
  }

  const multiple = Boolean(props.multiple);
  const result = await desktop.showOpenDialog({
    filters: mapDesktopOpenFilters(props.filters),
    multiple,
  });

  if (result.canceled || !result.filePaths?.length) {
    return { canceled: true, files: [] };
  }

  const files = await Promise.all(
    result.filePaths.map(async filePath => {
      const { name, data } = await desktop.readFile!(filePath);
      const bytes = new Uint8Array(data instanceof Uint8Array ? data : new Uint8Array(data));
      const fileName = name || 'file';
      const file = new File([bytes.buffer], fileName, {
        type: getFileMimeType(fileName, props.filters),
      });
      Object.assign(file, { path: filePath });
      return file;
    }),
  );

  return { canceled: false, files, filePaths: result.filePaths };
}

async function showNativeSaveDialog(props: SaveDialogProps): Promise<SaveDialogResult> {
  const desktop = getDesktopBridge();
  if (!desktop?.showSaveDialog) {
    throw new Error(t('errors.native-file-dialog-unavailable'));
  }

  const suggestedName = props.defaultPath || 'astrofox';
  const result = await desktop.showSaveDialog({
    defaultPath: suggestedName,
    filters: mapDesktopSaveFilters(props.filters),
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  return { canceled: false, filePath: result.filePath };
}

async function showWebOpenDialog(props: OpenDialogProps): Promise<OpenDialogResult> {
  const multiple = Boolean(props.multiple);
  const types = buildPickerTypes(props.filters || []);

  if (window.showOpenFilePicker) {
    try {
      const handles = await window.showOpenFilePicker({ types, multiple });
      const files = await Promise.all(handles.map((handle: FileHandle) => handle.getFile()));
      return { canceled: false, files, fileHandles: handles };
    } catch (error) {
      if (error && (error as Error).name === 'AbortError') {
        return { canceled: true, files: [] };
      }
      throw error;
    }
  }

  return new Promise<OpenDialogResult>(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    if (props.filters?.length) {
      const extensions = props.filters.flatMap((filter: FileFilter) => filter.extensions || []);
      input.accept = extensions.map((ext: string) => `.${ext}`).join(',');
    }
    input.onchange = () => {
      const files = Array.from(input.files || []);
      resolve({ canceled: files.length === 0, files });
    };
    // Cancel is not reliably detectable on all browsers; empty selection ≈ cancel.
    input.addEventListener('cancel', () => {
      resolve({ canceled: true, files: [] });
    });
    input.click();
  });
}

async function showWebSaveDialog(props: SaveDialogProps): Promise<SaveDialogResult> {
  const suggestedName = props.defaultPath || 'astrofox';
  const types = buildPickerTypes(props.filters || []);

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName, types });
      return { canceled: false, fileHandle: handle, filePath: handle.name };
    } catch (error) {
      if (error && (error as Error).name === 'AbortError') {
        return { canceled: true };
      }
      throw error;
    }
  }

  // No File System Access: caller downloads with this suggested name.
  return { canceled: false, filePath: suggestedName };
}

/**
 * Write a blob to a File System Access handle, absolute desktop path (ffmpeg),
 * or trigger a browser download. Prefer handles; absolute paths are only for
 * native-dialog / ffmpeg flows.
 */
async function saveBlob(target: FileHandle | string | null, blob: Blob, fallbackName: string) {
  if (target && typeof target === 'object' && 'createWritable' in target && target.createWritable) {
    const writable = await target.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  // Absolute paths come only from preferNativePath save dialogs (or legacy callers).
  const desktop = getDesktopBridge();
  if (desktop?.writeFile && typeof target === 'string' && isAbsoluteFilePath(target)) {
    const data = new Uint8Array(await blob.arrayBuffer());
    await desktop.writeFile(target, data);
    return;
  }

  const filename =
    typeof target === 'string' && !isAbsoluteFilePath(target) ? target : fallbackName || 'astrofox';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.split(/[\\/]/).pop() || filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Firefox and Safari may not start a download from a detached anchor, and
  // revoking the object URL in the same task can cancel the navigation before
  // the browser has consumed it. Release it after the download has started.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function getEnvironment() {
  const desktop = getDesktopBridge();
  if (desktop?.getEnvironment) {
    return {
      ...env,
      ...desktop.getEnvironment(),
      IS_DESKTOP: true,
    };
  }
  return env;
}

export function on(channel: string, callback: EventCallback) {
  events.on(channel, callback);
}

export function once(channel: string, callback: EventCallback) {
  events.once(channel, callback);
}

export function off(channel: string, callback: EventCallback) {
  events.off(channel, callback);
}

export function send(channel: string, data?: unknown) {
  events.emit(channel, data);
}

export async function invoke() {
  throw new Error(t('errors.ipc-invoke-unavailable'));
}

export function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

export async function minimizeWindow() {
  const desktop = getDesktopBridge();
  if (desktop?.minimizeWindow) {
    return desktop.minimizeWindow();
  }
}

export async function maximizeWindow() {
  const desktop = getDesktopBridge();
  if (desktop?.maximizeWindow) {
    return desktop.maximizeWindow();
  }
}

export async function closeWindow() {
  const desktop = getDesktopBridge();
  if (desktop?.closeWindow) {
    return desktop.closeWindow();
  }
}

export async function showOpenDialog(props: OpenDialogProps = {}): Promise<OpenDialogResult> {
  // Path-required flows (rare): native dialog only when explicitly requested and available.
  if (props.preferNativePath) {
    const desktop = getDesktopBridge();
    if (desktop?.showOpenDialog && desktop.readFile) {
      return showNativeOpenDialog(props);
    }
  }

  return showWebOpenDialog(props);
}

/**
 * Whether `showSaveDialog` can let the user pick a destination up front. When
 * false (e.g. Firefox/Safari without File System Access), the browser decides
 * the location itself when the download is triggered.
 */
export function canPickSaveLocation(props: Pick<SaveDialogProps, 'preferNativePath'> = {}) {
  if (props.preferNativePath && getDesktopBridge()?.showSaveDialog) {
    return true;
  }

  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
}

export async function showSaveDialog(props: SaveDialogProps = {}): Promise<SaveDialogResult> {
  if (props.preferNativePath) {
    const desktop = getDesktopBridge();
    if (desktop?.showSaveDialog) {
      return showNativeSaveDialog(props);
    }
  }

  return showWebSaveDialog(props);
}

export async function readAudioFile(file: File | FileHandle) {
  const audioFile = await toFile(file);

  if (!audioFile) {
    throw new Error(t('errors.no-audio-file-provided'));
  }

  let { type } = audioFile;

  if (audioFile.name?.endsWith('.opus')) {
    type = 'audio/opus';
  }

  if (!/^audio/.test(type)) {
    throw new Error(
      t('errors.unrecognized-audio-type', {
        type: type || t('common.unknown'),
      }),
    );
  }

  return audioFile.arrayBuffer();
}

export async function loadAudioTags(file: File | FileHandle) {
  try {
    const audioFile = await toFile(file);
    if (!audioFile) return null;
    return await new Promise<Record<string, unknown> | null>(resolve => {
      jsmediatags.read(audioFile, {
        onSuccess: (result: { tags: Record<string, unknown> | null }) =>
          resolve(result.tags || null),
        onError: (error: unknown) => {
          log(error);
          resolve(null);
        },
      });
    });
  } catch (error) {
    log(error);
    return null;
  }
}

export async function readImageFile(file: File | FileHandle) {
  const imageFile = await toFile(file);

  if (!imageFile) {
    throw new Error(t('errors.no-image-file-provided'));
  }

  return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(t('errors.read-image-file-failed')));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Return a playable video URL for a File. Prefer blob: URLs over data URLs so
 * large videos are not base64-expanded into memory twice.
 */
export async function readVideoFile(file: File | FileHandle) {
  const videoFile = await toFile(file);

  if (!videoFile) {
    throw new Error(t('errors.no-video-file-provided'));
  }

  if (videoFile.type && !/^video/.test(videoFile.type)) {
    throw new Error(t('errors.unrecognized-video-type', { type: videoFile.type }));
  }

  return URL.createObjectURL(videoFile);
}

export async function saveImageFile(
  target: FileHandle | string | null,
  data: BlobPart,
  props: SaveFileProps = {},
) {
  const mimeType = props.mimeType || 'image/png';
  const blob = new Blob([data], { type: mimeType });
  const filename = props.fileName || 'image.png';

  await saveBlob(target, blob, filename);
}

export async function saveVideoFile(
  target: FileHandle | string | null,
  data: BlobPart,
  props: SaveFileProps = {},
) {
  const mimeType = props.mimeType || 'video/webm';
  const blob = new Blob([data], { type: mimeType });
  const filename = props.fileName || 'video.webm';

  await saveBlob(target, blob, filename);
}

export async function saveTextFile(
  target: FileHandle | string | null,
  data: BlobPart,
  props: SaveFileProps = {},
) {
  const mimeType = props.mimeType || 'application/octet-stream';
  const blob = new Blob([data], { type: mimeType });
  const filename = props.fileName || 'download.txt';

  await saveBlob(target, blob, filename);
}

export async function loadPlugins() {
  return {};
}

export function getPlugins() {
  return {};
}

export function spawnProcess() {
  throw new Error(t('errors.process-spawning-unavailable'));
}

export function openDevTools() {}

export async function getWindowState() {
  const desktop = getDesktopBridge();
  if (desktop?.getWindowState) {
    return desktop.getWindowState();
  }
  return {
    focused: document.hasFocus(),
    maximized: false,
    minimized: false,
  };
}

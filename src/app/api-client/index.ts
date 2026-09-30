import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { t } from '@/i18n/config';
import EventEmitter from '@/lib/core/EventEmitter';
import { platform } from '@/lib/platform';
import { getFileMimeType } from '@/lib/platform/fileTypes';
import type {
  FileHandle,
  OpenDialogOptions,
  OpenDialogResult,
  SaveDialogOptions,
  SaveDialogResult,
  SaveTarget,
} from '@/lib/platform/types';
import type { EventCallback } from '@/lib/types';

export type { OpenDialogResult, SaveDialogResult };

const events = new EventEmitter();

interface SaveFileProps {
  mimeType?: string;
  fileName?: string;
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

/**
 * Pick files. The web pickers are used on the desktop too; set
 * `preferNativePath` only when a real OS path is required (ffmpeg).
 */
export function showOpenDialog(options: OpenDialogOptions = {}): Promise<OpenDialogResult> {
  return platform.dialogs.showOpen(options);
}

/**
 * Whether `showSaveDialog` can let the user pick a destination up front. When
 * false (e.g. Firefox/Safari without File System Access), the browser decides
 * the location itself when the download is triggered.
 */
export function canPickSaveLocation(options: Pick<SaveDialogOptions, 'preferNativePath'> = {}) {
  return platform.dialogs.canPickSaveLocation(options);
}

export function showSaveDialog(options: SaveDialogOptions = {}): Promise<SaveDialogResult> {
  return platform.dialogs.showSave(options);
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

export async function saveImageFile(target: SaveTarget, data: BlobPart, props: SaveFileProps = {}) {
  const mimeType = props.mimeType || 'image/png';
  const blob = new Blob([data], { type: mimeType });
  const filename = props.fileName || 'image.png';

  await platform.dialogs.write(target, blob, filename);
}

export async function saveVideoFile(target: SaveTarget, data: BlobPart, props: SaveFileProps = {}) {
  const mimeType = props.mimeType || 'video/webm';
  const blob = new Blob([data], { type: mimeType });
  const filename = props.fileName || 'video.webm';

  await platform.dialogs.write(target, blob, filename);
}

export async function saveTextFile(target: SaveTarget, data: BlobPart, props: SaveFileProps = {}) {
  const mimeType = props.mimeType || 'application/octet-stream';
  const blob = new Blob([data], { type: mimeType });
  const filename = props.fileName || 'download.txt';

  await platform.dialogs.write(target, blob, filename);
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

interface MediaBounds {
  width: number;
  height: number;
}

interface FileWithOptionalPath {
  path?: string;
  filePath?: string;
  fullPath?: string;
}

const LOCAL_MEDIA_PROTOCOL = 'astrofox-media:';

export function isLocalMediaUrl(source: unknown): source is string {
  return typeof source === 'string' && source.toLowerCase().startsWith(LOCAL_MEDIA_PROTOCOL);
}

export function toLocalMediaUrl(filePath: string): string {
  const normalizedPath = filePath.trim();

  if (!normalizedPath || isLocalMediaUrl(normalizedPath)) {
    return normalizedPath;
  }

  return `${LOCAL_MEDIA_PROTOCOL}//local/?path=${encodeURIComponent(normalizedPath)}`;
}

export function localMediaUrlToPath(source: string): string {
  if (!isLocalMediaUrl(source)) {
    return '';
  }

  try {
    const url = new URL(source);
    return url.host === 'local' ? url.searchParams.get('path')?.trim() || '' : '';
  } catch {
    return '';
  }
}

/**
 * Best-effort filesystem path on a File (Electron native open, or legacy drag-drop).
 * Web File System Access pickers never provide a path.
 */
export function getFileSystemPath(file: FileWithOptionalPath | File | null | undefined): string {
  if (!file || typeof file !== 'object') {
    return '';
  }

  const withPath = file as FileWithOptionalPath;
  for (const key of ['path', 'filePath', 'fullPath'] as const) {
    const value = withPath[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

/**
 * Playable URL for a video File: stream via desktop media protocol when a real
 * path is known; otherwise a blob: URL (same on web and desktop).
 */
export function resolveVideoSourceUrl(file: File, knownPath?: string): string {
  const sourcePath = (knownPath || getFileSystemPath(file)).trim();
  if (sourcePath) {
    return toLocalMediaUrl(sourcePath);
  }
  return URL.createObjectURL(file);
}

export function fitMediaWithinBounds(
  mediaWidth: number,
  mediaHeight: number,
  boundsWidth: number,
  boundsHeight: number,
): MediaBounds {
  if (!mediaWidth || !mediaHeight) {
    return {
      width: 0,
      height: 0,
    };
  }

  if (!boundsWidth || !boundsHeight) {
    return {
      width: mediaWidth,
      height: mediaHeight,
    };
  }

  const scale = Math.min(boundsWidth / mediaWidth, boundsHeight / mediaHeight);

  return {
    width: Math.round(mediaWidth * scale),
    height: Math.round(mediaHeight * scale),
  };
}

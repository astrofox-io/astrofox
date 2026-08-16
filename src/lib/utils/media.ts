interface MediaBounds {
  width: number;
  height: number;
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

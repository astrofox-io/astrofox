import type { FileFilter } from './types';

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

/** The MIME type for a file name: from a matching dialog filter, else by extension. */
export function getFileMimeType(fileName: string, filters: FileFilter[] = []) {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const filter = filters.find(item =>
    (item.extensions || []).some(candidate => candidate.toLowerCase() === extension),
  );

  return filter?.mimeType || FILE_MIME_TYPES[extension] || '';
}

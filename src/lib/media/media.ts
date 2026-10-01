import { BLANK_IMAGE } from '@/app/constants';
import { t } from '@/i18n/config';
import type { ElementSnapshot, ProjectSnapshot, SceneSnapshot } from '@/lib/core/migrateProject';
import type { MediaKind, MediaRef } from '@/lib/document/types';
import type { ProjectMedia } from '@/lib/project/project';
import {
  getFileSystemPath,
  isLocalMediaUrl,
  localMediaUrlToPath,
  toLocalMediaUrl,
} from '@/lib/utils/media';

/** What a media display takes as its `src` when new media is chosen. */
export type MediaElement = HTMLImageElement | HTMLVideoElement;

/** A file decoded for a media display. */
export interface LoadedMedia {
  /**
   * Decoded and ready to draw. Set as a display's `src`, the display fits
   * itself to it, as for newly chosen media.
   */
  element: MediaElement;
  /** The element's URL. Set as `src`, the display keeps its size, as for relinked media. */
  url: string;
  /** Where the file is on disk, or '' when the platform does not say (the web). */
  sourcePath: string;
}

/**
 * Media for media displays: loading a chosen file, writing it to a project
 * file and finding it again when the project is opened.
 *
 * Images become data URLs, so a saved project carries them. Videos stream from
 * their path on disk (`astrofox-media:`), or from a blob URL when there is no
 * path; a project file stores only the path.
 */
export interface Media extends ProjectMedia {
  /**
   * Decode a file. Give the file, its path, or both: an image needs the file,
   * a video with a path needs nothing else.
   */
  load(input: { file?: File; path?: string }, kind: MediaKind): Promise<LoadedMedia>;
}

/** What `createMedia` needs from the browser. */
export interface MediaDeps {
  /** The kind of media a display type shows (its `config.media`). */
  kindOf(displayName: string): MediaKind;
  /** An image file as a data URL. */
  readDataUrl(file: File): Promise<string>;
  /** A URL for a file that has no path on disk. Never revoked: undo can bring it back. */
  objectUrl(file: File): string;
  /** Decode a URL into an element. Rejects when the file cannot be decoded or takes too long. */
  decode(url: string, kind: MediaKind): Promise<MediaElement>;
  /** Whether a URL loads, answered quickly enough to check every file of a project being opened. */
  canLoad(url: string, kind: MediaKind): Promise<boolean>;
}

type KindOf = (element: Pick<ElementSnapshot, 'name'> | null | undefined) => MediaKind;

type MediaRefInput = Partial<MediaRef> & {
  path?: string;
};

/** Media saved inside the project file. The blank placeholder is no media at all. */
function isEmbeddedMediaSource(src: string) {
  return src !== BLANK_IMAGE && /^data:(image|video)\//i.test(src);
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

function getMediaLabel(
  element: Pick<ElementSnapshot, 'displayName' | 'name'> | null | undefined,
): string {
  return element?.displayName || element?.name || t('relink-media.media');
}

function buildMediaRef(
  element: Pick<ElementSnapshot, 'id' | 'name' | 'displayName'>,
  kind: MediaKind,
  sourcePath = '',
): MediaRef {
  return {
    displayId: element.id,
    kind,
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

function prepareSnapshotMediaForSave(snapshot: ProjectSnapshot, kindOf: KindOf) {
  const mediaRefs: MediaRef[] = [];

  const scenes = (snapshot?.scenes || []).map((scene: SceneSnapshot) => {
    const mapMediaProps = (element: ElementSnapshot) => {
      const src = element?.properties?.src;
      const sourcePath = normalizeMediaPath(element?.properties?.sourcePath);
      const kind = kindOf(element);

      if (sourcePath) {
        mediaRefs.push(buildMediaRef(element, kind, sourcePath));

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
        mediaRefs.push(buildMediaRef(element, kind, inferredSourcePath));

        return {
          ...element,
          properties: {
            ...element.properties,
            src: kindOf(element) === 'image' ? BLANK_IMAGE : toLocalMediaUrl(inferredSourcePath),
            sourcePath: inferredSourcePath,
          },
        };
      }

      if (isBlobMediaSource(src)) {
        mediaRefs.push(buildMediaRef(element, kind));

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
  payloadMediaRefs: MediaRefInput[],
  kindOf: KindOf,
  canLoad: MediaDeps['canLoad'],
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
        const kind = kindOf(element);

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
            const loadable = await canLoad(sourceUrl, kind);

            if (loadable) {
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

          unresolvedMediaRefs.push(buildMediaRef(element, kind, sourcePath));

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
          unresolvedMediaRefs.push(buildMediaRef(element, kind));

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

export function createMedia(deps: MediaDeps): Media {
  const kindOf: KindOf = element => deps.kindOf(element?.name ?? '');

  async function load(
    input: { file?: File; path?: string },
    kind: MediaKind,
  ): Promise<LoadedMedia> {
    const { file } = input;
    const sourcePath = normalizeMediaPath(input.path) || getFileSystemPath(file);
    let url: string;

    if (kind === 'video' && sourcePath) {
      url = toLocalMediaUrl(sourcePath);
    } else if (!file) {
      throw new Error(`A ${kind} file is required.`);
    } else if (kind === 'image') {
      url = await deps.readDataUrl(file);
    } else {
      url = deps.objectUrl(file);
    }

    const element = await deps.decode(url, kind);
    return { element, url, sourcePath };
  }

  return {
    load,
    forSave: snapshot => prepareSnapshotMediaForSave(snapshot, kindOf),
    async resolve(snapshot, mediaRefs) {
      const resolved = await resolveSnapshotMediaOnLoad(
        snapshot,
        mediaRefs as MediaRefInput[],
        kindOf,
        deps.canLoad,
      );
      return {
        snapshot: resolved.snapshot,
        unresolvedMediaRefs: mergeMediaRefs(resolved.unresolvedMediaRefs),
      };
    },
  };
}

import { BLANK_IMAGE } from '@/app/constants';
import { library } from '@/app/global';
import { t } from '@/i18n/config';
import type { ElementSnapshot, ProjectSnapshot, SceneSnapshot } from '@/lib/core/migrateProject';
import type { MediaKind, MediaRef } from '@/lib/document/types';
import type { ProjectMedia } from '@/lib/project/project';
import { isLocalMediaUrl, localMediaUrlToPath, toLocalMediaUrl } from '@/lib/utils/media';

type MediaRefInput = Partial<MediaRef> & {
  path?: string;
};

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

/**
 * Media in project files: local files are saved as paths (`sourcePath`) and
 * found again on open; embedded and remote images are saved as they are.
 */
export const projectMedia: ProjectMedia = {
  forSave: prepareSnapshotMediaForSave,
  async resolve(snapshot, mediaRefs) {
    const resolved = await resolveSnapshotMediaOnLoad(snapshot, mediaRefs as MediaRefInput[]);
    return {
      snapshot: resolved.snapshot,
      unresolvedMediaRefs: mergeMediaRefs(resolved.unresolvedMediaRefs),
    };
  },
};

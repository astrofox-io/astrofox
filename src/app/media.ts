import { api, library } from '@/app/global';
import type { MediaKind } from '@/lib/document/types';
import { createMedia, type MediaElement } from '@/lib/media/media';

/** How long a chosen file may take to decode before loading it fails. */
const DECODE_TIMEOUT = 15_000;

function decode(url: string, kind: MediaKind): Promise<MediaElement> {
  const element = kind === 'image' ? new Image() : document.createElement('video');

  if (element instanceof HTMLVideoElement) {
    // Video displays play this element: silent, inline, and usable as a WebGL texture.
    element.muted = true;
    element.playsInline = true;
    element.preload = 'auto';
    element.crossOrigin = 'anonymous';
  }

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => fail('Media loading timed out.'), DECODE_TIMEOUT);

    function cleanup() {
      window.clearTimeout(timer);
      element.onload = null;
      element.onerror = null;
      if (element instanceof HTMLVideoElement) element.onloadeddata = null;
    }

    function fail(message: string) {
      cleanup();
      if (element instanceof HTMLVideoElement) {
        element.removeAttribute('src');
        element.load();
      }
      reject(new Error(message));
    }

    function loaded() {
      cleanup();
      resolve(element);
    }

    element.onerror = () => fail(`The selected ${kind} could not be decoded.`);
    // A video is ready once its first frame is, so a preview right after loading shows it.
    if (element instanceof HTMLVideoElement) element.onloadeddata = loaded;
    else element.onload = loaded;
    element.src = url;
  });
}

async function canLoad(src: string, kind: MediaKind): Promise<boolean> {
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

/** Media for the app's media displays, decoded by the browser. */
export const media = createMedia({
  kindOf(displayName) {
    const displays = (library.get('displays') ?? {}) as Record<
      string,
      { config?: { media?: string } }
    >;
    return displays[displayName]?.config?.media === 'video' ? 'video' : 'image';
  },
  async readDataUrl(file) {
    const url = await api.readImageFile(file);
    if (typeof url !== 'string') {
      throw new Error('The selected image could not be decoded.');
    }
    return url;
  },
  objectUrl: file => URL.createObjectURL(file),
  decode,
  canLoad,
});

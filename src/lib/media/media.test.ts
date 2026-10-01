import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BLANK_IMAGE } from '@/app/constants';
import type { ElementSnapshot, ProjectSnapshot } from '@/lib/core/migrateProject';
import type { MediaKind } from '@/lib/document/types';
import { toLocalMediaUrl } from '@/lib/utils/media';
import { createMedia, type Media, type MediaElement } from './media';

const PNG = 'data:image/png;base64,AAAA';

let loadable: Set<string>;
let media: Media;
const decode = vi.fn(async (url: string, _kind: MediaKind) => ({ src: url }) as MediaElement);
const objectUrl = vi.fn((_file: File) => 'blob:astrofox/1');

function file(name: string, path?: string) {
  const result = new File(['bytes'], name);
  if (path) Object.assign(result, { path });
  return result;
}

function image(id: string, properties: Record<string, unknown>): ElementSnapshot {
  return { id, name: 'ImageDisplay', displayName: `Image ${id}`, properties };
}

function video(id: string, properties: Record<string, unknown>): ElementSnapshot {
  return { id, name: 'VideoDisplay', displayName: `Video ${id}`, properties };
}

function project(...displays: ElementSnapshot[]): ProjectSnapshot {
  return { scenes: [{ id: 's1', name: 'Scene', displays, effects: [] }] };
}

function displays(snapshot: ProjectSnapshot) {
  return snapshot.scenes?.[0].displays ?? [];
}

beforeEach(() => {
  loadable = new Set();
  decode.mockClear();
  objectUrl.mockClear();
  media = createMedia({
    kindOf: name => (name === 'VideoDisplay' ? 'video' : 'image'),
    readDataUrl: async () => PNG,
    objectUrl,
    decode,
    canLoad: async url => loadable.has(url),
  });
});

describe('load', () => {
  it('reads an image into a data URL and decodes it', async () => {
    const loaded = await media.load({ file: file('a.png', 'C:\\media\\a.png') }, 'image');

    expect(loaded.url).toBe(PNG);
    expect(loaded.sourcePath).toBe('C:\\media\\a.png');
    expect(loaded.element.src).toBe(PNG);
    expect(decode).toHaveBeenCalledWith(PNG, 'image');
  });

  it('streams a video from its path, without reading the file', async () => {
    const loaded = await media.load({ path: ' C:\\media\\clip.mp4 ' }, 'video');

    expect(loaded.url).toBe(toLocalMediaUrl('C:\\media\\clip.mp4'));
    expect(loaded.sourcePath).toBe('C:\\media\\clip.mp4');
    expect(objectUrl).not.toHaveBeenCalled();
  });

  it("uses the file's own path when none is given", async () => {
    const loaded = await media.load({ file: file('clip.mp4', '/home/me/clip.mp4') }, 'video');

    expect(loaded.url).toBe(toLocalMediaUrl('/home/me/clip.mp4'));
  });

  it('plays a video without a path from a blob URL', async () => {
    const loaded = await media.load({ file: file('clip.mp4') }, 'video');

    expect(loaded.url).toBe('blob:astrofox/1');
    expect(loaded.sourcePath).toBe('');
  });

  it('needs the file for an image', async () => {
    await expect(media.load({ path: 'C:\\a.png' }, 'image')).rejects.toThrow();
  });

  it('fails when the file cannot be decoded', async () => {
    decode.mockRejectedValueOnce(new Error('bad file'));

    await expect(media.load({ file: file('a.png') }, 'image')).rejects.toThrow('bad file');
  });
});

describe('forSave', () => {
  it('keeps images in the file and records where they came from', () => {
    const { snapshot, mediaRefs } = media.forSave(
      project(image('i1', { src: PNG, sourcePath: 'C:\\a.png' })),
    );

    expect(displays(snapshot)[0].properties).toEqual({ src: PNG, sourcePath: 'C:\\a.png' });
    expect(mediaRefs).toEqual([
      { displayId: 'i1', kind: 'image', label: 'Image i1', sourcePath: 'C:\\a.png' },
    ]);
  });

  it('saves a video as its path', () => {
    const { snapshot, mediaRefs } = media.forSave(
      project(video('v1', { src: 'blob:astrofox/1', sourcePath: 'C:\\clip.mp4' })),
    );

    expect(displays(snapshot)[0].properties).toEqual({
      src: toLocalMediaUrl('C:\\clip.mp4'),
      sourcePath: 'C:\\clip.mp4',
    });
    expect(mediaRefs[0].sourcePath).toBe('C:\\clip.mp4');
  });

  it('works out the path from a streamed video that has none recorded', () => {
    const { snapshot } = media.forSave(
      project(video('v1', { src: toLocalMediaUrl('C:\\clip.mp4') })),
    );

    expect(displays(snapshot)[0].properties?.sourcePath).toBe('C:\\clip.mp4');
  });

  it('cannot save a video that has no path, and says so', () => {
    const { snapshot, mediaRefs } = media.forSave(
      project(video('v1', { src: 'blob:astrofox/1', sourcePath: '' })),
    );

    expect(displays(snapshot)[0].properties?.src).toBe(BLANK_IMAGE);
    expect(mediaRefs).toEqual([
      { displayId: 'v1', kind: 'video', label: 'Video v1', sourcePath: '' },
    ]);
  });

  it('leaves displays without media alone', () => {
    const blank = image('i1', { src: BLANK_IMAGE });
    const { snapshot, mediaRefs } = media.forSave(project(blank));

    expect(displays(snapshot)[0]).toBe(blank);
    expect(mediaRefs).toEqual([]);
  });
});

describe('resolve', () => {
  it('streams a video that is still on disk', async () => {
    loadable.add(toLocalMediaUrl('C:\\clip.mp4'));

    const { snapshot, unresolvedMediaRefs } = await media.resolve(
      project(video('v1', { src: BLANK_IMAGE, sourcePath: 'C:\\clip.mp4' })),
      [],
    );

    expect(displays(snapshot)[0].properties?.src).toBe(toLocalMediaUrl('C:\\clip.mp4'));
    expect(unresolvedMediaRefs).toEqual([]);
  });

  it('reports a video that is missing and blanks it', async () => {
    const { snapshot, unresolvedMediaRefs } = await media.resolve(
      project(video('v1', { src: toLocalMediaUrl('C:\\gone.mp4'), sourcePath: 'C:\\gone.mp4' })),
      [],
    );

    expect(displays(snapshot)[0].properties?.src).toBe(BLANK_IMAGE);
    expect(unresolvedMediaRefs).toEqual([
      { displayId: 'v1', kind: 'video', label: 'Video v1', sourcePath: 'C:\\gone.mp4' },
    ]);
  });

  it('keeps an image saved in the file', async () => {
    const { snapshot, unresolvedMediaRefs } = await media.resolve(
      project(image('i1', { src: PNG, sourcePath: 'C:\\a.png' })),
      [],
    );

    expect(displays(snapshot)[0].properties?.src).toBe(PNG);
    expect(unresolvedMediaRefs).toEqual([]);
  });

  it("takes a missing path from the file's media references", async () => {
    const { unresolvedMediaRefs } = await media.resolve(
      project(video('v1', { src: BLANK_IMAGE })),
      [{ displayId: 'v1', kind: 'video', label: 'Clip', path: 'C:\\clip.mp4' }],
    );

    expect(unresolvedMediaRefs[0].sourcePath).toBe('C:\\clip.mp4');
  });

  it('still reports media that was missing when the project was last saved', async () => {
    const { snapshot, unresolvedMediaRefs } = await media.resolve(
      project(
        video('v1', { src: BLANK_IMAGE, sourcePath: 'C:\\gone.mp4' }),
        image('i1', { src: BLANK_IMAGE, sourcePath: 'C:\\gone.png' }),
      ),
      [],
    );

    expect(displays(snapshot).map(display => display.properties?.sourcePath)).toEqual([
      'C:\\gone.mp4',
      'C:\\gone.png',
    ]);
    expect(unresolvedMediaRefs.map(ref => ref.displayId).sort()).toEqual(['i1', 'v1']);
  });

  it('reports media that was only ever in memory', async () => {
    const { snapshot, unresolvedMediaRefs } = await media.resolve(
      project(video('v1', { src: 'blob:astrofox/1' })),
      [],
    );

    expect(displays(snapshot)[0].properties?.src).toBe(BLANK_IMAGE);
    expect(unresolvedMediaRefs).toEqual([
      { displayId: 'v1', kind: 'video', label: 'Video v1', sourcePath: '' },
    ]);
  });

  it('opens what it saved', async () => {
    const before = project(
      image('i1', { src: PNG, sourcePath: 'C:\\a.png' }),
      video('v1', { src: 'blob:astrofox/1', sourcePath: 'C:\\clip.mp4' }),
    );
    loadable.add(toLocalMediaUrl('C:\\clip.mp4'));

    const saved = media.forSave(before);
    const { snapshot, unresolvedMediaRefs } = await media.resolve(saved.snapshot, saved.mediaRefs);

    expect(displays(snapshot).map(display => display.properties?.src)).toEqual([
      PNG,
      toLocalMediaUrl('C:\\clip.mp4'),
    ]);
    expect(unresolvedMediaRefs).toEqual([]);
  });
});

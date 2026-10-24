import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadAudioTags } from './index';

vi.mock('@/i18n/config', () => ({ t: (key: string) => key }));
vi.mock('@/lib/platform', () => ({ platform: {} }));

afterEach(() => vi.restoreAllMocks());

describe('loadAudioTags', () => {
  // Original 440 Hz tones generated with FFmpeg, with title/artist metadata.
  for (const extension of ['mp3', 'm4a', 'ogg', 'opus', 'oga']) {
    it(`reads ${extension} tags from a File without a MIME type`, async () => {
      const data = await readFile(new URL(`./fixtures/metadata.${extension}`, import.meta.url));
      expect(await loadAudioTags(new File([data], `metadata.${extension}`))).toEqual({
        artist: 'Test artist',
        title: 'Test song',
      });
    });
  }

  it('formats multiple artists for the existing status display', async () => {
    const data = await readFile(new URL('./fixtures/multiple-artists.mp3', import.meta.url));
    expect(await loadAudioTags(new File([data], 'multiple-artists.mp3'))).toEqual({
      artist: 'First / Second',
      title: 'Test song',
    });
  });

  it('reads a file handle returned by the picker', async () => {
    const data = await readFile(new URL('./fixtures/metadata.ogg', import.meta.url));
    const getFile = vi.fn(async () => new File([data], 'metadata.ogg'));
    expect(await loadAudioTags({ name: 'metadata.ogg', getFile, createWritable: vi.fn() })).toEqual(
      {
        artist: 'Test artist',
        title: 'Test song',
      },
    );
    expect(getFile).toHaveBeenCalledOnce();
  });

  it('returns null and logs unrecognized media', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await loadAudioTags(new File(['invalid audio'], 'invalid.bin'))).toBeNull();
    expect(log).toHaveBeenCalledOnce();
  });

  it('returns null and logs when a file handle cannot be read', async () => {
    const error = new Error('Permission denied');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const getFile = vi.fn().mockRejectedValue(error);
    expect(
      await loadAudioTags({ name: 'metadata.ogg', getFile, createWritable: vi.fn() }),
    ).toBeNull();
    expect(log).toHaveBeenCalledWith(error);
  });
});

import { describe, expect, it, vi } from 'vitest';
import type { DesktopBridge } from './channels';
import { createDesktopPlatform } from './desktop';

type Call = { channel: string; payload: unknown };

/** A bridge that records every call and answers from `results`. */
function fakeBridge(environment: Record<string, unknown>, results: Record<string, unknown> = {}) {
  const calls: Call[] = [];
  const sent: Call[] = [];
  const listeners = new Map<string, (...payload: unknown[]) => void>();

  const bridge = {
    isDesktop: true,
    environment,
    storage: {} as DesktopBridge['storage'],
    invoke: vi.fn(async (channel: string, payload?: unknown) => {
      calls.push({ channel, payload });
      return results[channel];
    }),
    send: vi.fn((channel: string, payload?: unknown) => {
      sent.push({ channel, payload });
    }),
    on: vi.fn((channel: string, listener: (...payload: unknown[]) => void) => {
      listeners.set(channel, listener);
      return () => listeners.delete(channel);
    }),
  } as unknown as DesktopBridge;

  return { bridge, calls, sent, listeners };
}

const FFMPEG = { FFMPEG_AVAILABLE: true, FFMPEG_PATH: '/bin/ffmpeg', TEMP_PATH: '/tmp/Astrofox' };

describe('capabilities', () => {
  it('offers the encoder only when ffmpeg is installed', () => {
    expect(createDesktopPlatform(fakeBridge(FFMPEG).bridge).encoder).not.toBeNull();
    expect(
      createDesktopPlatform(fakeBridge({ FFMPEG_AVAILABLE: false }).bridge).encoder,
    ).toBeNull();
    expect(
      createDesktopPlatform(fakeBridge({ FFMPEG_AVAILABLE: true, FFMPEG_PATH: '' }).bridge).encoder,
    ).toBeNull();
  });

  it('offers the updater in packaged builds, or when explicitly enabled', () => {
    expect(createDesktopPlatform(fakeBridge({ IS_PACKAGED: true }).bridge).updater).not.toBeNull();
    expect(createDesktopPlatform(fakeBridge({ IS_PACKAGED: false }).bridge).updater).toBeNull();
    expect(
      createDesktopPlatform(fakeBridge({ IS_PACKAGED: false, UPDATER_ENABLED: true }).bridge)
        .updater,
    ).not.toBeNull();
  });

  it('merges the build environment under the machine one', () => {
    const platform = createDesktopPlatform(fakeBridge({ OS_PLATFORM: 'darwin' }).bridge, {
      APP_NAME: 'Astrofox',
      OS_PLATFORM: 'web',
    });

    expect(platform.isDesktop).toBe(true);
    expect(platform.environment).toMatchObject({
      APP_NAME: 'Astrofox',
      OS_PLATFORM: 'darwin',
      IS_DESKTOP: true,
    });
  });
});

describe('channels', () => {
  it('sends each call to its channel with the payload the main process expects', async () => {
    const { bridge, calls } = fakeBridge(FFMPEG, {
      'desktop:write-temp-file': { filePath: '/tmp/Astrofox/a.wav' },
      'desktop:remove-path': { ok: true },
      'desktop:read-file': { name: 'a.wav', data: new ArrayBuffer(2) },
    });
    const platform = createDesktopPlatform(bridge);
    const files = platform.files!;
    const encoder = platform.encoder!;

    await expect(files.writeTemp('a.wav', new Uint8Array(1))).resolves.toBe('/tmp/Astrofox/a.wav');
    await expect(files.removeTemp('/tmp/Astrofox/a.wav')).resolves.toBe(true);
    await expect(files.read('/music/a.wav')).resolves.toMatchObject({ name: 'a.wav' });
    await encoder.startPipe('job', ['-i', '-']);
    await encoder.cancel('job');

    expect(calls).toEqual([
      {
        channel: 'desktop:write-temp-file',
        payload: { name: 'a.wav', data: new Uint8Array(1) },
      },
      { channel: 'desktop:remove-path', payload: { filePath: '/tmp/Astrofox/a.wav' } },
      { channel: 'desktop:read-file', payload: { filePath: '/music/a.wav' } },
      { channel: 'ffmpeg:start-pipe', payload: { job: 'job', args: ['-i', '-'] } },
      { channel: 'ffmpeg:cancel', payload: { job: 'job' } },
    ]);
  });

  it('reads files as bytes whatever the IPC delivered', async () => {
    const { bridge } = fakeBridge(
      {},
      { 'desktop:read-file': { name: 'a', data: new ArrayBuffer(3) } },
    );
    const { data } = await createDesktopPlatform(bridge).files!.read('/a');

    expect(data).toBeInstanceOf(Uint8Array);
    expect(data.byteLength).toBe(3);
  });

  it('writes a save to an absolute path through the main process', async () => {
    const { bridge, calls } = fakeBridge({}, { 'desktop:write-file': { ok: true } });

    await createDesktopPlatform(bridge).dialogs.write(
      'C:\\Videos\\out.webm',
      new Blob(['hi']),
      'video.webm',
    );

    expect(calls[0].channel).toBe('desktop:write-file');
    expect(calls[0].payload).toMatchObject({ filePath: 'C:\\Videos\\out.webm' });
  });

  it('opens a native dialog only when a real path is needed', async () => {
    const { bridge, calls } = fakeBridge(
      {},
      {
        'dialog:show-save': { canceled: false, filePath: '/Videos/out.mp4' },
      },
    );
    const platform = createDesktopPlatform(bridge);

    await expect(
      platform.dialogs.showSave({
        preferNativePath: true,
        defaultPath: 'out.mp4',
        filters: [{ name: 'MP4', extensions: ['mp4'] }],
      }),
    ).resolves.toEqual({ canceled: false, filePath: '/Videos/out.mp4' });
    expect(calls[0]).toEqual({
      channel: 'dialog:show-save',
      payload: { defaultPath: 'out.mp4', filters: [{ name: 'MP4', extensions: ['mp4'] }] },
    });
    expect(platform.dialogs.canPickSaveLocation({ preferNativePath: true })).toBe(true);
  });
});

describe('automation', () => {
  it('announces itself, takes commands and signs off', () => {
    const { bridge, sent, listeners } = fakeBridge({});
    const automation = createDesktopPlatform(bridge).automation!;
    const commands = vi.fn();

    const stop = automation.onCommand(commands);
    expect(sent.map(call => call.channel)).toEqual(['mcp:ready']);

    listeners.get('mcp:probe')?.();
    expect(sent.map(call => call.channel)).toEqual(['mcp:ready', 'mcp:ready']);

    listeners.get('mcp:command')?.({ id: '1' });
    expect(commands).toHaveBeenCalledWith({ id: '1' });

    stop();
    expect(sent.at(-1)?.channel).toBe('mcp:not-ready');
    expect(listeners.size).toBe(0);
  });
});

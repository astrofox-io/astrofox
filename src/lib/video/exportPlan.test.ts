import { describe, expect, it } from 'vitest';
import {
  type ExportContext,
  ExportError,
  type ExportErrorCode,
  type ExportRequest,
  planExport,
} from './exportPlan';

const offline: ExportContext = {
  mode: 'offline',
  duration: 30,
  projectFps: 30,
  hasAudio: true,
  busy: false,
};

const toFile = { output: { path: '/videos/out.mp4' } };

function failure(request: ExportRequest, context: ExportContext = offline): ExportErrorCode {
  try {
    planExport(request, context);
  } catch (error) {
    if (error instanceof ExportError) return error.code;
    throw error;
  }
  throw new Error('Expected the request to be refused.');
}

describe('defaults', () => {
  it('exports the whole project at the project frame rate, with audio', () => {
    expect(planExport(toFile, { ...offline, projectFps: 60 })).toEqual({
      mode: 'offline',
      startTime: 0,
      endTime: 30,
      fps: 60,
      encoder: 'x264',
      quality: 'medium',
      includeAudio: true,
      overwrite: true,
      output: { path: '/videos/out.mp4' },
    });
  });

  it('keeps what the request asks for', () => {
    expect(
      planExport(
        {
          ...toFile,
          startTime: 5,
          endTime: 12.5,
          fps: 30,
          encoder: 'webm',
          quality: 'high',
          includeAudio: false,
          overwrite: false,
        },
        offline,
      ),
    ).toMatchObject({
      startTime: 5,
      endTime: 12.5,
      encoder: 'webm',
      quality: 'high',
      includeAudio: false,
      overwrite: false,
    });
  });
});

describe('range', () => {
  it('must lie inside the project', () => {
    expect(failure({ ...toFile, startTime: -1 })).toBe('range');
    expect(failure({ ...toFile, endTime: 31 })).toBe('range');
    expect(failure({ ...toFile, startTime: Number.NaN })).toBe('range');
  });

  it('must end after it starts', () => {
    expect(failure({ ...toFile, startTime: 10, endTime: 10 })).toBe('range');
    expect(failure({ ...toFile, startTime: 30 })).toBe('range');
  });

  it('accepts an end computed from the duration in floating point', () => {
    const duration = 0.1 + 0.2;
    expect(
      planExport({ ...toFile, endTime: 0.30000000000000004 }, { ...offline, duration }).endTime,
    ).toBe(duration);
  });

  it('needs a project duration', () => {
    expect(failure(toFile, { ...offline, duration: 0 })).toBe('duration');
    expect(failure(toFile, { ...offline, duration: Number.NaN })).toBe('duration');
  });
});

describe('everything else', () => {
  it('runs one export at a time', () => {
    expect(failure(toFile, { ...offline, busy: true })).toBe('busy');
  });

  it('needs a way to export', () => {
    expect(failure(toFile, { ...offline, mode: null })).toBe('unsupported');
  });

  it('allows only the timeline frame rates', () => {
    expect(failure({ ...toFile, fps: 24 })).toBe('fps');
  });

  it('refuses unknown encoders', () => {
    expect(failure({ ...toFile, encoder: 'gif' as never })).toBe('encoder');
  });

  it('needs audio only when it is included', () => {
    const silent = { ...offline, hasAudio: false };
    expect(failure(toFile, silent)).toBe('audio');
    expect(planExport({ ...toFile, includeAudio: false }, silent).includeAudio).toBe(false);
  });

  it('needs an absolute path offline, and any output realtime', () => {
    expect(failure({ output: { path: 'out.mp4' } })).toBe('output');
    expect(failure({ output: {} })).toBe('output');
    expect(planExport({ output: { path: 'C:\\videos\\out.mp4' } }, offline).mode).toBe('offline');

    const realtime = { ...offline, mode: 'realtime' as const };
    expect(planExport({ output: { name: 'out.webm' } }, realtime).mode).toBe('realtime');
  });

  it('checks busy before anything else', () => {
    expect(failure({ output: {}, endTime: 99 }, { ...offline, busy: true, mode: null })).toBe(
      'busy',
    );
  });
});

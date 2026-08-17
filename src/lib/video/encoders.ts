export const VIDEO_ENCODERS = ['x264', 'x265', 'nvenc', 'webm'] as const;
export type VideoEncoder = (typeof VIDEO_ENCODERS)[number];

export const VIDEO_QUALITIES = ['low', 'medium', 'high'] as const;
export type VideoQuality = (typeof VIDEO_QUALITIES)[number];

export type VideoEncoderConfig = {
  label: string;
  video: {
    encoder: string;
    extension: string;
    /** Options placed before the output file for every quality level. */
    output: string[];
    /** Extra options when remuxing the encoded video with audio. */
    merge: string[];
    quality: Record<VideoQuality, string[]>;
  };
  audio: {
    encoder: string;
    extension: string;
    settings: string[];
  };
};

/**
 * ffmpeg encoder presets. Quality → ffmpeg mappings for x264, NVEnc and WebM
 * follow the Astrofox v1 `config/video.json`; x265 mirrors the x264 ladder with
 * HEVC-appropriate CRF values.
 */
export const VIDEO_ENCODER_CONFIG: Record<VideoEncoder, VideoEncoderConfig> = {
  x264: {
    label: 'x264',
    video: {
      encoder: 'libx264',
      extension: 'mp4',
      output: ['-profile:v', 'high', '-tune', 'animation', '-movflags', '+faststart'],
      merge: ['-movflags', '+faststart'],
      quality: {
        low: ['-preset', 'veryfast', '-crf', '23'],
        medium: ['-preset', 'medium', '-crf', '20'],
        high: ['-preset', 'slow', '-crf', '18'],
      },
    },
    audio: {
      encoder: 'aac',
      extension: 'm4a',
      settings: ['-b:a', '192k'],
    },
  },
  x265: {
    label: 'x265',
    video: {
      encoder: 'libx265',
      extension: 'mp4',
      // hvc1 tag is required for QuickTime/Apple playback of HEVC in MP4.
      output: ['-tag:v', 'hvc1', '-tune', 'animation', '-movflags', '+faststart'],
      merge: ['-tag:v', 'hvc1', '-movflags', '+faststart'],
      quality: {
        low: ['-preset', 'veryfast', '-crf', '26'],
        medium: ['-preset', 'medium', '-crf', '23'],
        high: ['-preset', 'slow', '-crf', '20'],
      },
    },
    audio: {
      encoder: 'aac',
      extension: 'm4a',
      settings: ['-b:a', '192k'],
    },
  },
  nvenc: {
    label: 'NVEnc',
    video: {
      encoder: 'h264_nvenc',
      extension: 'mp4',
      output: ['-movflags', '+faststart'],
      merge: ['-movflags', '+faststart'],
      quality: {
        low: ['-tune', 'll', '-preset', 'p3', '-profile:v', 'high', '-rc', 'constqp', '-qp', '27'],
        medium: [
          '-tune',
          'hq',
          '-preset',
          'p4',
          '-profile:v',
          'high',
          '-rc',
          'constqp',
          '-qp',
          '23',
        ],
        high: ['-tune', 'hq', '-preset', 'p6', '-profile:v', 'high', '-rc', 'constqp', '-qp', '20'],
      },
    },
    audio: {
      encoder: 'aac',
      extension: 'm4a',
      settings: ['-b:a', '192k'],
    },
  },
  webm: {
    label: 'WebM',
    video: {
      encoder: 'libvpx',
      extension: 'webm',
      output: ['-quality', 'good', '-cpu-used', '0', '-qmin', '0', '-qmax', '50', '-b:v', '20M'],
      merge: [],
      quality: {
        low: ['-crf', '10'],
        medium: ['-crf', '5'],
        high: ['-crf', '4'],
      },
    },
    audio: {
      encoder: 'libvorbis',
      extension: 'ogg',
      settings: ['-qscale:a', '6'],
    },
  },
};

export function getVideoEncoderConfig(encoder: VideoEncoder): VideoEncoderConfig {
  return VIDEO_ENCODER_CONFIG[encoder] ?? VIDEO_ENCODER_CONFIG.x264;
}

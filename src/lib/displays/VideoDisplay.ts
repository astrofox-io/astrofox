import { BLANK_IMAGE } from '@/app/constants';
import Display from '@/lib/core/Display';
import { isDefined } from '@/lib/utils/array';
import { fitMediaWithinBounds } from '@/lib/utils/media';

interface VideoDisplayInstance {
  hasVideo: boolean;
  video: HTMLVideoElement;
  scene: { getSize(): { width: number; height: number } };
  properties: Record<string, unknown>;
}

const disabled = (display: VideoDisplayInstance) => !display.hasVideo;
const maxWidth = (display: VideoDisplayInstance) => {
  const { width } = display.scene.getSize();
  const videoWidth = display.video?.videoWidth || 0;

  return videoWidth > width ? videoWidth : width;
};
const maxHeight = (display: VideoDisplayInstance) => {
  const { height } = display.scene.getSize();
  const videoHeight = display.video?.videoHeight || 0;

  return videoHeight > height ? videoHeight : height;
};
const maxX = (display: VideoDisplayInstance) => (disabled(display) ? 0 : maxWidth(display));
const maxY = (display: VideoDisplayInstance) => (disabled(display) ? 0 : maxHeight(display));
const getFittedSize = (display: VideoDisplayInstance, mediaWidth: number, mediaHeight: number) => {
  const { width, height } = display.scene.getSize();
  return fitMediaWithinBounds(mediaWidth, mediaHeight, width, height);
};

export default class VideoDisplay extends Display {
  declare video: HTMLVideoElement;
  declare scene: { getSize(): { width: number; height: number } };

  static config = {
    name: 'VideoDisplay',
    description: 'Displays a video.',
    type: 'display',
    label: 'Video',
    order: 3,
    media: 'video',
    transform: {
      fixedAspect: true,
      naturalSize: (display: VideoDisplay) => ({
        width: Number(display.video?.videoWidth) || 0,
        height: Number(display.video?.videoHeight) || 0,
      }),
    },
    defaultProperties: {
      src: BLANK_IMAGE,
      sourcePath: '',
      x: 0,
      y: 0,
      zoom: 1,
      width: 0,
      height: 0,
      fixed: true,
      rotation: 0,
      opacity: 0,
      loop: true,
      startTime: 0,
      endTime: 0,
    },
    controls: {
      src: {
        label: 'Video',
        type: 'video',
      },
      width: {
        label: 'Width',
        type: 'number',
        min: 0,
        max: maxWidth,
        withRange: true,
        withLink: 'fixed',
        disabled,
      },
      height: {
        label: 'Height',
        type: 'number',
        min: 0,
        max: maxHeight,
        withRange: true,
        withLink: 'fixed',
        disabled,
      },
      rotation: {
        group: 'Appearance',
        label: 'Rotation',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
        disabled,
      },
      zoom: {
        group: 'Appearance',
        label: 'Scale',
        type: 'number',
        min: 1,
        max: 10,
        step: 0.01,
        withRange: true,
        withReactor: true,
        disabled,
      },
      opacity: {
        group: 'Appearance',
        label: 'Opacity',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
        disabled,
      },
      x: {
        group: 'Position',
        label: 'X',
        type: 'number',
        min: (display: VideoDisplayInstance) => -1 * maxX(display),
        max: (display: VideoDisplayInstance) => maxX(display),
        withRange: true,
        hideFill: true,
        disabled,
      },
      y: {
        group: 'Position',
        label: 'Y',
        type: 'number',
        min: (display: VideoDisplayInstance) => -1 * maxY(display),
        max: (display: VideoDisplayInstance) => maxY(display),
        withRange: true,
        hideFill: true,
        disabled,
      },
      loop: {
        label: 'Loop',
        type: 'toggle',
        disabled,
      },
      startTime: {
        label: 'Start Time',
        type: 'number',
        min: 0,
        max: 600,
        step: 0.1,
        withRange: true,
        disabled,
      },
      endTime: {
        label: 'End Time',
        type: 'number',
        min: 0,
        max: 600,
        step: 0.1,
        withRange: true,
        disabled,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(VideoDisplay, properties);

    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.preload = 'metadata';
    this.video.crossOrigin = 'anonymous';

    const props = this.properties as Record<string, unknown>;
    if (props.src !== BLANK_IMAGE) {
      this.video.src = props.src as string;
    }
  }

  get hasVideo() {
    return (this.properties as Record<string, unknown>).src !== BLANK_IMAGE;
  }

  handleTimeUpdate = () => {
    const { loop, startTime, endTime } = this.properties as Record<string, unknown>;

    if (loop && (endTime as number) > 0 && this.video.currentTime >= (endTime as number)) {
      this.video.currentTime = Math.max(0, (startTime as number) || 0);
    }
  };

  update(properties: Record<string, unknown>) {
    const { src: inputSrc, loop, startTime, endTime, fixed, width, height } = properties;
    const { src, width: w, height: h, fixed: f } = this.properties as Record<string, unknown>;
    let loadedVideo: HTMLVideoElement | null = null;
    let nextProperties = properties;

    if (typeof inputSrc === 'object' && (inputSrc as HTMLVideoElement)?.src) {
      loadedVideo = inputSrc as HTMLVideoElement;

      if (loadedVideo.src === BLANK_IMAGE) {
        nextProperties = { ...VideoDisplay.config.defaultProperties };
      } else if (loadedVideo.src !== src || !w || !h) {
        const fittedSize = getFittedSize(this, loadedVideo.videoWidth, loadedVideo.videoHeight);
        nextProperties = {
          ...properties,
          src: loadedVideo.src,
          width: fittedSize.width,
          height: fittedSize.height,
          opacity: 1,
        };
      } else {
        nextProperties.src = loadedVideo.src;
      }
    }

    const nextInputSrc = nextProperties.src;
    const srcChanged = typeof nextInputSrc === 'string' && nextInputSrc !== src;

    if (!loadedVideo && !srcChanged && (fixed || f) && isDefined(width, height, fixed)) {
      const videoWidth = this.video.videoWidth;
      const videoHeight = this.video.videoHeight;
      if (!videoWidth || !videoHeight) {
        return super.update({});
      }

      const ratio = videoWidth / videoHeight;

      if (!isDefined(width, height)) {
        if ((w as number) > (h as number)) {
          nextProperties.height = Math.round((w as number) * (1 / ratio)) || 0;
          nextProperties.width = Math.round((nextProperties.height as number) * ratio);
        } else {
          nextProperties.width = Math.round((h as number) * ratio);
          nextProperties.height = Math.round((nextProperties.width as number) * (1 / ratio)) || 0;
        }
      }

      if (width) {
        nextProperties.height = Math.round((width as number) * (1 / ratio)) || 0;
      }
      if (height) {
        nextProperties.width = Math.round((height as number) * ratio);
      }
    }

    const nextSrcChanged = typeof nextProperties.src === 'string' && nextProperties.src !== src;
    const changed = super.update(nextProperties);

    if (changed) {
      const p = this.properties as Record<string, unknown>;
      if (loop !== undefined || endTime !== undefined) {
        this.video.loop = Boolean(p.loop && !p.endTime);
      }

      if (nextSrcChanged) {
        if (p.src === BLANK_IMAGE) {
          this.video.pause();
          this.video.removeAttribute('src');
          this.video.load();
        } else if (loadedVideo) {
          this.video.pause();
          this.video.removeAttribute('src');
          this.video.load();
          this.video = loadedVideo;
          this.video.loop = Boolean(p.loop && !p.endTime);
          this.video.currentTime = Math.max(0, (p.startTime as number) || 0);
        } else {
          this.video.src = p.src as string;
          this.video.loop = Boolean(p.loop && !p.endTime);

          const onLoadedMetadata = () => {
            const props = this.properties as Record<string, unknown>;
            this.video.currentTime = Math.max(0, (props.startTime as number) || 0);

            const nextProps: Record<string, unknown> = {};
            if (!props.width && !props.height) {
              const fittedSize = getFittedSize(this, this.video.videoWidth, this.video.videoHeight);
              nextProps.width = fittedSize.width;
              nextProps.height = fittedSize.height;
            }
            if (props.opacity === 0) {
              nextProps.opacity = 1;
            }

            if (Object.keys(nextProps).length > 0) {
              super.update(nextProps);
            }
          };

          if (this.video.readyState >= 1) {
            onLoadedMetadata();
          } else {
            this.video.addEventListener('loadedmetadata', onLoadedMetadata, {
              once: true,
            });
          }
        }
      } else {
        if (startTime !== undefined && this.video.readyState >= 1) {
          this.video.currentTime = Math.max(0, (p.startTime as number) || 0);
        }
      }
    }

    return changed;
  }

  dispose() {
    this.video.pause();
    this.video.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.video.removeAttribute('src');
    this.video.load();
  }
}

import { VideoTexture } from 'three';
import WebGLDisplay from 'core/WebGLDisplay';
import { BLANK_IMAGE } from 'view/constants';
import ImagePass from 'graphics/ImagePass';
import { deg2rad } from 'utils/math';

const disabled = display => !display.hasVideo;

export default class VideoDisplay extends WebGLDisplay {
  static config = {
    name: 'VideoDisplay',
    description: 'Displays a video.',
    type: 'display',
    label: 'Video',
    defaultProperties: {
      src: BLANK_IMAGE,
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
        max: 4096,
        withRange: true,
        withLink: 'fixed',
        disabled,
      },
      height: {
        label: 'Height',
        type: 'number',
        min: 0,
        max: 4096,
        withRange: true,
        withLink: 'fixed',
        disabled,
      },
      x: {
        label: 'X',
        type: 'number',
        min: -4096,
        max: 4096,
        withRange: true,
        disabled,
      },
      y: {
        label: 'Y',
        type: 'number',
        min: -4096,
        max: 4096,
        withRange: true,
        disabled,
      },
      zoom: {
        label: 'Zoom',
        type: 'number',
        min: 1.0,
        max: 4.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
        disabled,
      },
      rotation: {
        label: 'Rotation',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
        disabled,
      },
      opacity: {
        label: 'Opacity',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
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
        max: 1000,
        step: 0.1,
        withRange: true,
        disabled,
      },
      endTime: {
        label: 'End Time',
        type: 'number',
        min: 0,
        max: 1000,
        step: 0.1,
        withRange: true,
        disabled,
      },
    },
  };

  constructor(properties) {
    super(VideoDisplay, properties);

    this.video = document.createElement('video');
    this.video.src = this.properties.src;
    this.video.loop = this.properties.loop;
    this.video.muted = true;
    this.video.play();

    this.video.addEventListener('timeupdate', this.handleTimeUpdate);
  }

  get hasVideo() {
    return this.properties.src !== BLANK_IMAGE;
  }

  handleTimeUpdate = () => {
    const { loop, startTime, endTime } = this.properties;

    if (loop && endTime > 0 && this.video.currentTime >= endTime) {
      this.video.currentTime = startTime;
    }
  };

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
        const { src, loop, startTime, endTime, opacity, zoom, width, height, x, y, rotation } = properties;

        if (src) {
            this.video.src = src;
        }

        if (loop !== undefined) {
            this.video.loop = loop;
        }

        if (startTime !== undefined || endTime !== undefined) {
            this.video.currentTime = this.properties.startTime;
        }

        if (src) {
            const texture = new VideoTexture(this.video);
            const { width, height } = this.scene.getSize();
            this.pass = new ImagePass(texture, { width, height });
            this.pass.camera.aspect = width / height;
            this.pass.camera.updateProjectionMatrix();
        }
        if (zoom !== undefined) {
            const { camera } = this.pass;
            camera.zoom = zoom;
            camera.updateProjectionMatrix();
        }
        if (width) {
            this.pass.mesh.scale.x = width / this.video.videoWidth;
        }
        if (height) {
            this.pass.mesh.scale.y = height / this.video.videoHeight;
        }
        if (opacity) {
            this.pass.material.opacity = opacity;
        }
        if (x !== undefined) {
            this.pass.mesh.position.x = x;
        }
        if (y !== undefined) {
            this.pass.mesh.position.y = y;
        }
        if (rotation !== undefined) {
            this.pass.mesh.rotation.z = deg2rad(-rotation);
        }
    }

    return changed;
  }

  addToScene({ getSize }) {
    const { width, height } = getSize();

    const texture = new VideoTexture(this.video);

    this.pass = new ImagePass(texture, { width, height });

    this.setSize(width, height);
  }

  setSize(width, height) {
    if (this.pass) {
      this.pass.camera.aspect = width / height;
      this.pass.camera.updateProjectionMatrix();
    }
  }

  dispose() {
    this.video.removeEventListener('timeupdate', this.handleTimeUpdate);
    super.dispose();
  }
}

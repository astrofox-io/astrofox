import Effect from 'core/Effect';
import BoxBlurShader from 'shaders/BoxBlurShader';
import CircularBlurShader from 'shaders/CircularBlurShader';
import ZoomBlurShader from 'shaders/ZoomBlurShader';
import ShaderPass from 'graphics/ShaderPass';
import GaussianBlurPass from 'effects/passes/GaussianBlurPass';
import TriangleBlurPass from 'effects/passes/TriangleBlurPass';
import LensBlurPass from 'effects/passes/LensBlurPass';
import { val2pct } from 'utils/math';
import { stageWidth, stageHeight, property } from 'utils/controls';

const blurOptions = ['Box', 'Circular', 'Gaussian', 'Triangle', 'Zoom'];

const shaderOptions = {
  Box: BoxBlurShader,
  Circular: CircularBlurShader,
  Zoom: ZoomBlurShader,
};

const BOX_BLUR_MAX = 10;
const TRIANGLE_BLUR_MAX = 200;
const CIRCULAR_BLUR_MAX = 10;
const ZOOM_BLUR_MAX = 1;

const showZoomOption = property('type', value => value !== 'Zoom');
const showLensOption = property('type', value => value !== 'Lens');

export default class BlurEffect extends Effect {
  static config = {
    name: 'BlurEffect',
    description: 'Blur effect.',
    type: 'effect',
    label: 'Blur',
    defaultProperties: {
      type: 'Gaussian',
      amount: 0.3,
      x: 0,
      y: 0,
      radius: 10,
      brightness: 0.75,
      angle: 0,
    },
    controls: {
      type: {
        label: 'Type',
        type: 'select',
        items: blurOptions,
      },
      amount: {
        label: 'Amount',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      x: {
        label: 'X',
        type: 'number',
        min: stageWidth(n => -n / 2),
        max: stageWidth(n => n / 2),
        hidden: showZoomOption,
        withRange: true,
      },
      y: {
        label: 'Y',
        type: 'number',
        min: stageHeight(n => -n / 2),
        max: stageHeight(n => n / 2),
        hidden: showZoomOption,
        withRange: true,
      },
      radius: {
        label: 'Radius',
        type: 'number',
        min: 0,
        max: 50,
        hidden: showLensOption,
        withRange: true,
      },
      brightness: {
        label: 'Brightness',
        type: 'number',
        min: -1,
        max: 1,
        step: 0.01,
        hidden: showLensOption,
        withRange: true,
      },
      angle: {
        label: 'Angle',
        type: 'number',
        min: -180,
        max: 180,
        hidden: showLensOption,
        withRange: true,
      },
    },
  };

  constructor(properties) {
    super(BlurEffect, properties);
  }

  update(properties) {
    const { type } = properties;
    const { type: currentType } = this.properties;

    if (type !== undefined && type !== currentType) {
      this.pass = this.getShaderPass(type);
    }

    return super.update(properties);
  }

  updatePass() {
    const { type, amount, x, y, radius, brightness, angle } = this.properties;
    const { width, height } = this.scene.getSize();

    switch (type) {
      case 'Box':
        this.pass.setUniforms({ amount: amount * BOX_BLUR_MAX });
        break;

      case 'Triangle':
        this.pass.setUniforms({ amount: amount * TRIANGLE_BLUR_MAX, width, height });
        break;

      case 'Circular':
        this.pass.setUniforms({ amount: amount * CIRCULAR_BLUR_MAX });
        break;

      case 'Gaussian':
        this.pass.setUniforms({ amount });
        break;

      case 'Lens':
        this.pass.setUniforms({ radius, brightness, angle, width, height });
        break;

      case 'Zoom':
        this.pass.setUniforms({
          amount: amount * ZOOM_BLUR_MAX,
          center: [val2pct(x, -width / 2, width / 2), val2pct(y, -height / 2, height / 2)],
        });
        break;
    }
  }

  addToScene() {
    this.pass = this.getShaderPass(this.properties.type);

    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }

  getShaderPass(type) {
    const { width, height } = this.scene.getSize();
    let pass;

    switch (type) {
      case 'Gaussian':
        pass = new GaussianBlurPass();
        break;

      case 'Triangle':
        pass = new TriangleBlurPass();
        break;

      case 'Lens':
        pass = new LensBlurPass();
        break;

      default:
        pass = new ShaderPass(shaderOptions[type]);
    }

    pass.setSize(width, height);

    return pass;
  }
}

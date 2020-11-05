import Effect from 'core/Effect';
import BoxBlurShader from 'shaders/BoxBlurShader';
import CircularBlurShader from 'shaders/CircularBlurShader';
import ZoomBlurShader from 'shaders/ZoomBlurShader';
import ShaderPass from 'graphics/ShaderPass';
import GaussianBlurPass from 'graphics/GaussianBlurPass';
import { val2pct } from 'utils/math';
import { stageWidth, stageHeight, property } from 'utils/controls';

const blurOptions = ['Box', 'Circular', 'Gaussian', 'Zoom'];

const shaderOptions = {
  Box: BoxBlurShader,
  Circular: CircularBlurShader,
  Zoom: ZoomBlurShader,
};

const BOX_BLUR_MAX = 20;
const CIRCULAR_BLUR_MAX = 10;
const ZOOM_BLUR_MAX = 1;

const showZoomOption = property('type', value => value !== 'Zoom');

export default class BlurEffect extends Effect {
  static info = {
    name: 'BlurEffect',
    description: 'Blur effect.',
    type: 'effect',
    label: 'Blur',
  };

  static defaultProperties = {
    type: 'Gaussian',
    amount: 0.3,
    x: 0,
    y: 0,
  };

  static controls = {
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
    const { type, amount, x, y } = this.properties;
    const { width, height } = this.scene.getSize();

    switch (type) {
      case 'Box':
        this.pass.setUniforms({ amount: amount * BOX_BLUR_MAX });
        break;

      case 'Circular':
        this.pass.setUniforms({ amount: amount * CIRCULAR_BLUR_MAX });
        break;

      case 'Gaussian':
        this.pass.setAmount(amount);
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

      default:
        pass = new ShaderPass(shaderOptions[type]);
    }

    pass.setSize(width, height);

    return pass;
  }
}

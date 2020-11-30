import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import ColorHalftoneShader from 'shaders/ColorHalftoneShader';
import { deg2rad } from '../utils/math';

export default class ColorHalftoneEffect extends Effect {
  static config = {
    name: 'ColorHalftoneEffect',
    description: 'Color halftone effect.',
    type: 'effect',
    label: 'Color Halftone',
    defaultProperties: {
      scale: 0.5,
      angle: 0,
    },
    controls: {
      scale: {
        label: 'Scale',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      angle: {
        label: 'Angle',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties) {
    super(ColorHalftoneEffect, properties);
  }

  updatePass() {
    const { scale, angle } = this.properties;

    this.pass.setUniforms({
      scale: 1 - scale,
      angle: deg2rad(angle),
    });
  }

  addToScene() {
    this.pass = new ShaderPass(ColorHalftoneShader);

    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}

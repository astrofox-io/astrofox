import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import { toRadians } from '@/lib/core/render/constants';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import ColorHalftoneShader from '@/lib/core/render/effects/shaders/ColorHalftoneShader';

const halftoneShapeOptions = ['Dot', 'Ellipse', 'Line', 'Square', 'Diamond'];

export default class ColorHalftoneEffect extends Effect {
  static config = {
    name: 'ColorHalftoneEffect',
    description: 'Color halftone effect.',
    type: 'effect',
    label: 'Color Halftone',
    category: 'pattern',
    defaultProperties: {
      shape: 'Dot',
      radius: 4,
      rotateR: 15,
      rotateG: 30,
      rotateB: 45,
      scatter: 0,
    },
    controls: {
      shape: {
        label: 'Shape',
        type: 'select',
        items: halftoneShapeOptions,
      },
      radius: {
        label: 'Radius',
        type: 'number',
        min: 1,
        max: 25,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      rotateR: {
        label: 'Red Angle',
        type: 'number',
        min: 0,
        max: 90,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      rotateG: {
        label: 'Green Angle',
        type: 'number',
        min: 0,
        max: 90,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      rotateB: {
        label: 'Blue Angle',
        type: 'number',
        min: 0,
        max: 90,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      scatter: {
        label: 'Scatter',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(ColorHalftoneEffect, properties);
  }
}

const HALFTONE_SHAPE_MAP: Record<string, number> = {
  Dot: 1,
  Ellipse: 2,
  Line: 3,
  Square: 4,
  Diamond: 5,
};

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new ShaderPass(ColorHalftoneShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      width,
      height,
      shape: HALFTONE_SHAPE_MAP[String(props.shape)] || HALFTONE_SHAPE_MAP.Dot,
      radius: Math.max(1, Number(props.radius ?? 4)),
      rotateR: toRadians(Number(props.rotateR ?? props.angle ?? 15)),
      rotateG: toRadians(Number(props.rotateG ?? 30)),
      rotateB: toRadians(Number(props.rotateB ?? 45)),
      scatter: Number(props.scatter ?? 0),
    });
  });
}
registerEffectPass(ColorHalftoneEffect.config.name, createPass, { liveUpdatable: true });

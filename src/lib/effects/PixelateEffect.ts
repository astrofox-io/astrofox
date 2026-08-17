import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import HexagonShader from '@/lib/core/render/effects/shaders/HexagonShader';
import PixelateShader from '@/lib/core/render/effects/shaders/PixelateShader';

const renderOptions = ['Square', 'Hexagon'];

export default class PixelateEffect extends Effect {
  static config = {
    name: 'PixelateEffect',
    description: 'Pixelate effect.',
    type: 'effect',
    label: 'Pixelate',
    category: 'pattern',
    defaultProperties: {
      type: 'Square',
      size: 10,
    },
    controls: {
      type: {
        label: 'Type',
        type: 'select',
        items: renderOptions,
      },
      size: {
        label: 'Size',
        type: 'number',
        min: 2,
        max: 240,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(PixelateEffect, properties);
  }
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const hexagon = (props.type || 'Square') === 'Hexagon';
  const pass = new ShaderPass(hexagon ? HexagonShader : PixelateShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setSize(width, height);
    pass.setUniforms({ size: Number(props.size || 10) });
    if (hexagon) {
      pass.setUniforms({ center: [width / 2, height / 2] });
    }
  });
}
registerEffectPass(PixelateEffect.config.name, createPass, {
  liveUpdatable: true,
  structuralProps: ['type'],
});

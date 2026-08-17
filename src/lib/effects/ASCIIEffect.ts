import Effect from '@/lib/core/Effect';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import AsciiPass from '@/lib/core/render/effects/passes/AsciiPass';

export default class ASCIIEffect extends Effect {
  static config = {
    name: 'ASCIIEffect',
    description: 'ASCII art effect.',
    type: 'effect',
    label: 'ASCII',
    category: 'pattern',
    defaultProperties: {
      fontSize: 54,
      cellSize: 16,
      color: '#ffffff',
      invert: false,
    },
    controls: {
      fontSize: {
        label: 'Font Size',
        type: 'number',
        min: 8,
        max: 128,
        step: 1,
        withRange: true,
      },
      cellSize: {
        label: 'Cell Size',
        type: 'number',
        min: 4,
        max: 64,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      color: {
        label: 'Color',
        type: 'color',
      },
      invert: {
        label: 'Invert',
        type: 'toggle',
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(ASCIIEffect, properties);
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new AsciiPass({
    cellSize: Number(props.cellSize ?? 16),
    fontSize: Number(props.fontSize ?? 54),
    invert: !!props.invert,
  });
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.updateOptions({
      cellSize: Number(props.cellSize ?? 16),
      fontSize: Number(props.fontSize ?? 54),
      invert: Boolean(props.invert),
    });
  });
}
registerEffectPass(ASCIIEffect.config.name, createPass, { liveUpdatable: true });

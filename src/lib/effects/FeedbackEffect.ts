import Effect from '@/lib/core/Effect';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import FeedbackPass from '@/lib/core/render/effects/passes/FeedbackPass';

export default class FeedbackEffect extends Effect {
  static config = {
    name: 'FeedbackEffect',
    description: 'Frame feedback echo that accumulates previous frames with decay.',
    type: 'effect',
    label: 'Feedback Echo',
    category: 'stylize',
    defaultProperties: {
      decay: 0.85,
      zoom: 1.0,
    },
    controls: {
      decay: {
        label: 'Decay',
        type: 'number',
        min: 0,
        max: 0.99,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      zoom: {
        label: 'Zoom',
        type: 'number',
        min: 1.0,
        max: 1.1,
        step: 0.001,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(FeedbackEffect, properties);
  }
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new FeedbackPass(width, height);
  return attachPassUpdater(pass, frameData => {
    pass.enabled = isEffectEnabled(effect);
    pass.accumulate = frameData ? Boolean(frameData.hasUpdate) : true;
    pass.setUniforms({
      decay: Number(props.decay || 0),
      zoom: Math.max(1, Number(props.zoom || 1)),
    });
  });
}
registerEffectPass(FeedbackEffect.config.name, createPass, { liveUpdatable: true });

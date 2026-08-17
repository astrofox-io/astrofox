import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import { toRadians } from '@/lib/core/render/constants';
import {
  attachPassUpdater,
  type EffectPassConfig,
  type EffectPassLike,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import GaussianBlurPass from '@/lib/core/render/effects/passes/GaussianBlurPass';
import LensBlurPass from '@/lib/core/render/effects/passes/LensBlurPass';
import TriangleBlurPass from '@/lib/core/render/effects/passes/TriangleBlurPass';
import BoxBlurShader from '@/lib/core/render/effects/shaders/BoxBlurShader';
import CircularBlurShader from '@/lib/core/render/effects/shaders/CircularBlurShader';
import ZoomBlurShader from '@/lib/core/render/effects/shaders/ZoomBlurShader';
import { property, stageHeight, stageWidth } from '@/lib/utils/controls';
import { normalize } from '@/lib/utils/math';

const blurOptions = ['Box', 'Circular', 'Gaussian', 'Triangle', 'Zoom'];

const showZoomOption = property('type', (value: unknown) => value !== 'Zoom');
const showLensOption = property('type', (value: unknown) => value !== 'Lens');

export default class BlurEffect extends Effect {
  static config = {
    name: 'BlurEffect',
    description: 'Blur effect.',
    type: 'effect',
    label: 'Blur',
    category: 'blur-focus',
    order: 1,
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
        min: stageWidth((n: number) => -n / 2),
        max: stageWidth((n: number) => n / 2),
        hidden: showZoomOption,
        withRange: true,
      },
      y: {
        label: 'Y',
        type: 'number',
        min: stageHeight((n: number) => -n / 2),
        max: stageHeight((n: number) => n / 2),
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

  constructor(properties?: Record<string, unknown>) {
    super(BlurEffect, properties);
  }
}

const BOX_BLUR_MAX = 10;
const TRIANGLE_BLUR_MAX = 200;
const CIRCULAR_BLUR_MAX = 10;
const ZOOM_BLUR_MAX = 1;

// The blur passes are untyped three.js classes with differing setUniforms
// signatures; treat them uniformly here.
type BlurPass = EffectPassLike & { setUniforms: (uniforms: Record<string, unknown>) => void };

function createBlurPass(blurType: unknown): BlurPass {
  switch (blurType) {
    case 'Box':
      return new ShaderPass(BoxBlurShader);
    case 'Circular':
      return new ShaderPass(CircularBlurShader);
    case 'Triangle':
      return new TriangleBlurPass() as unknown as BlurPass;
    case 'Lens':
      return new LensBlurPass() as unknown as BlurPass;
    case 'Zoom':
      return new ShaderPass(ZoomBlurShader);
    default:
      return new GaussianBlurPass() as unknown as BlurPass;
  }
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const blurType = props.type || 'Gaussian';
  const pass = createBlurPass(blurType);

  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setSize?.(width, height);

    switch (blurType) {
      case 'Box':
        pass.setUniforms({ amount: Number(props.amount || 0) * BOX_BLUR_MAX });
        break;
      case 'Circular':
        pass.setUniforms({ amount: Number(props.amount || 0) * CIRCULAR_BLUR_MAX });
        break;
      case 'Triangle':
        pass.setUniforms({ amount: Number(props.amount || 0) * TRIANGLE_BLUR_MAX, width, height });
        break;
      case 'Lens':
        pass.setUniforms({
          radius: Number(props.radius || 10),
          brightness: Number(props.brightness || 0.75),
          angle: toRadians(Number(props.angle || 0)),
          width,
          height,
        });
        break;
      case 'Zoom':
        pass.setUniforms({
          amount: Number(props.amount || 0) * ZOOM_BLUR_MAX,
          center: [
            normalize(Number(props.x || 0), -width / 2, width / 2),
            normalize(Number(props.y || 0), -height / 2, height / 2),
          ],
        });
        break;
      default:
        pass.setUniforms({ amount: Number(props.amount || 0) });
        break;
    }
  });
}
registerEffectPass(BlurEffect.config.name, createPass, {
  liveUpdatable: true,
  structuralProps: ['type'],
});

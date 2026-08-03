// @ts-nocheck
import { normalize } from '@/lib/utils/math';
import ShaderPass from '../composer/ShaderPass';
import { toRadians } from '../constants';
import GaussianBlurPass from './passes/GaussianBlurPass';
import LensBlurPass from './passes/LensBlurPass';
import TriangleBlurPass from './passes/TriangleBlurPass';
import BoxBlurShader from './shaders/BoxBlurShader';
import CircularBlurShader from './shaders/CircularBlurShader';
import ColorHalftoneShader from './shaders/ColorHalftoneShader';
import DistortionShader from './shaders/DistortionShader';
import DotScreenShader from './shaders/DotScreenShader';
import GlowShader from './shaders/GlowShader';
import HexagonShader from './shaders/HexagonShader';
import KaleidoscopeShader from './shaders/KaleidoscopeShader';
import LEDShader from './shaders/LEDShader';
import MirrorShader from './shaders/MirrorShader';
import NoiseShader from './shaders/NoiseShader';
import PerlinNoiseShader from './shaders/PerlinNoiseShader';
import PixelateShader from './shaders/PixelateShader';
import RGBShiftShader from './shaders/RGBShiftShader';
import ZoomBlurShader from './shaders/ZoomBlurShader';

const DISTORTION_MAX = 30;
const GLOW_MAX = 5;
const BOX_BLUR_MAX = 10;
const TRIANGLE_BLUR_MAX = 200;
const CIRCULAR_BLUR_MAX = 10;
const ZOOM_BLUR_MAX = 1;
const HALFTONE_SHAPE_MAP = {
  Dot: 1,
  Ellipse: 2,
  Line: 3,
  Square: 4,
  Diamond: 5,
};

function attachUpdater(pass, update) {
  pass.__updateScenePass = update;
  update();
  return pass;
}

export function createScenePass(effectConfig, width, height) {
  const props = effectConfig.properties || {};

  switch (effectConfig.name) {
    case 'RGBShiftEffect': {
      const pass = new ShaderPass(RGBShiftShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setUniforms({
          amount: Number(props.offset || 0) / Math.max(1, Number(width || 1)),
          angle: toRadians(Number(props.angle || 0)),
        });
      });
    }
    case 'DistortionEffect': {
      const pass = new ShaderPass(DistortionShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setSize(width, height);
        pass.setUniforms({
          amount: Number(props.amount || 0) * DISTORTION_MAX,
          time: Number(effectConfig.time || props.time || 0),
        });
      });
    }
    case 'MirrorEffect': {
      const pass = new ShaderPass(MirrorShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setUniforms({
          side: Number(props.side || 0),
        });
      });
    }
    case 'KaleidoscopeEffect': {
      const pass = new ShaderPass(KaleidoscopeShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setUniforms({
          sides: Math.max(1, Number(props.sides || 6)),
          angle: toRadians(Number(props.angle || 0)),
        });
      });
    }
    case 'PixelateEffect': {
      const pixelateType = props.type || 'Square';
      const shader = pixelateType === 'Hexagon' ? HexagonShader : PixelateShader;
      const pass = new ShaderPass(shader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setSize(width, height);
        pass.setUniforms({
          size: Number(props.size || 10),
        });
        if (pixelateType === 'Hexagon') {
          pass.setUniforms({
            center: [width / 2, height / 2],
          });
        }
      });
    }
    case 'DotScreenEffect': {
      const pass = new ShaderPass(DotScreenShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setUniforms({
          tSize: [width, height],
          center: [width / 2, height / 2],
          scale: 2 - Number(props.scale || 0) * 2,
          angle: toRadians(Number(props.angle || 0)),
        });
      });
    }
    case 'GlowEffect': {
      const pass = new ShaderPass(GlowShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setSize(width, height);
        pass.setUniforms({
          amount: Number(props.amount || 0) * GLOW_MAX,
          intensity: Number(props.intensity || 1),
        });
      });
    }
    case 'BlurEffect': {
      const blurType = props.type || 'Gaussian';
      let pass = null;

      switch (blurType) {
        case 'Box':
          pass = new ShaderPass(BoxBlurShader);
          break;
        case 'Circular':
          pass = new ShaderPass(CircularBlurShader);
          break;
        case 'Triangle':
          pass = new TriangleBlurPass();
          break;
        case 'Lens':
          pass = new LensBlurPass();
          break;
        case 'Zoom':
          pass = new ShaderPass(ZoomBlurShader);
          break;
        default:
          pass = new GaussianBlurPass();
          break;
      }

      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setSize?.(width, height);

        switch (blurType) {
          case 'Box':
            pass.setUniforms({
              amount: Number(props.amount || 0) * BOX_BLUR_MAX,
            });
            break;
          case 'Circular':
            pass.setUniforms({
              amount: Number(props.amount || 0) * CIRCULAR_BLUR_MAX,
            });
            break;
          case 'Triangle':
            pass.setUniforms({
              amount: Number(props.amount || 0) * TRIANGLE_BLUR_MAX,
              width,
              height,
            });
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
            pass.setUniforms({
              amount: Number(props.amount || 0),
            });
            break;
        }
      });
    }
    case 'ColorHalftoneEffect': {
      const pass = new ShaderPass(ColorHalftoneShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setUniforms({
          width,
          height,
          shape: HALFTONE_SHAPE_MAP[props.shape] || HALFTONE_SHAPE_MAP.Dot,
          radius: Math.max(1, Number(props.radius ?? 4)),
          rotateR: toRadians(Number(props.rotateR ?? props.angle ?? 15)),
          rotateG: toRadians(Number(props.rotateG ?? 30)),
          rotateB: toRadians(Number(props.rotateB ?? 45)),
          scatter: Number(props.scatter ?? 0),
        });
      });
    }
    case 'LEDEffect': {
      const pass = new ShaderPass(LEDShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setSize(width, height);
        pass.setUniforms({
          spacing: Number(props.spacing || 10),
          size: Number(props.size || 4),
          blur: Number(props.blur || 4),
        });
      });
    }
    case 'NoiseEffect': {
      const pass = new ShaderPass(NoiseShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setSize(width, height);
        pass.setUniforms({
          time: Number(effectConfig.time || props.time || 0),
          premultiply: props.premultiply ? 1 : 0,
        });
      });
    }
    case 'PerlinNoiseEffect': {
      const pass = new ShaderPass(PerlinNoiseShader);
      pass.enabled = effectConfig.enabled !== false;
      return attachUpdater(pass, () => {
        pass.setSize(width, height);
        pass.setUniforms({
          time: Number(effectConfig.time || props.time || 0),
          amount: Number(props.amount ?? 0.35),
          scale: Number(props.scale ?? 3),
        });
      });
    }
    default:
      return null;
  }
}

export default createScenePass;

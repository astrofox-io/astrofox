// @ts-nocheck
import ShaderPass from '../composer/ShaderPass';
import { toRadians } from '../constants';
import AsciiPass from './passes/AsciiPass';
import GlitchPass from './passes/GlitchPass';
import UnrealBloomEffectPass from './passes/UnrealBloomEffectPass';
import {
  BrightnessContrastShader,
  ColorAverageShader,
  ColorDepthShader,
  HueSaturationShader,
  ScanlineShader,
  SepiaShader,
  TiltShiftShader,
  ToneMappingShader,
  VignetteShader,
} from './shaders/PostEffectShaders';

function attachUpdater(pass, update) {
  pass.__updateScenePass = update;
  update();
  return pass;
}

function createBrightnessContrastPass(effectConfig, props) {
  const pass = new ShaderPass(BrightnessContrastShader);
  return attachUpdater(pass, () => {
    const brightness = Number(props.brightness ?? 0);
    const contrast = Number(props.contrast ?? 0);
    pass.enabled =
      effectConfig.enabled !== false &&
      (Math.abs(brightness) > 0.0001 || Math.abs(contrast) > 0.0001);
    pass.setUniforms({
      brightness,
      contrast,
    });
  });
}

function createColorAveragePass(effectConfig) {
  const pass = new ShaderPass(ColorAverageShader);
  return attachUpdater(pass, () => {
    pass.enabled = effectConfig.enabled !== false;
  });
}

function createColorDepthPass(effectConfig, props) {
  const pass = new ShaderPass(ColorDepthShader);
  return attachUpdater(pass, () => {
    pass.enabled = effectConfig.enabled !== false;
    pass.setUniforms({
      bits: Number(props.bits ?? 16),
    });
  });
}

function createHueSaturationPass(effectConfig, props) {
  const pass = new ShaderPass(HueSaturationShader);
  return attachUpdater(pass, () => {
    const hue = toRadians(Number(props.hue ?? 0));
    const saturation = Number(props.saturation ?? 0);
    pass.enabled =
      effectConfig.enabled !== false && (Math.abs(hue) > 0.0001 || Math.abs(saturation) > 0.0001);
    pass.setUniforms({
      hue,
      saturation,
    });
  });
}

function createSepiaPass(effectConfig, props) {
  const pass = new ShaderPass(SepiaShader);
  return attachUpdater(pass, () => {
    const intensity = Number(props.intensity ?? 0);
    pass.enabled = effectConfig.enabled !== false && Math.abs(intensity) > 0.0001;
    pass.setUniforms({
      intensity,
    });
  });
}

function createToneMappingPass(effectConfig, props) {
  const pass = new ShaderPass(ToneMappingShader);
  return attachUpdater(pass, () => {
    pass.enabled = effectConfig.enabled !== false;
    pass.setUniforms({
      adaptive: (props.toneMappingAdaptive ?? props.adaptive ?? false) ? 1 : 0,
      middleGrey: Number(props.middleGrey ?? 0.6),
      maxLuminance: Number(props.maxLuminance ?? 16),
      averageLuminance: Number(props.averageLuminance ?? 1),
      adaptationRate: Number(props.adaptationRate ?? 1),
    });
  });
}

export function createRawEffect(effectConfig, width, height) {
  const props = effectConfig.properties || {};

  switch (effectConfig.name) {
    case 'BloomEffect': {
      const pass = new UnrealBloomEffectPass({
        width,
        height,
        exposure: Number(props.exposure ?? 1),
        strength: Number(props.strength ?? 1.5),
        radius: Number(props.radius ?? 0),
        threshold: Number(props.threshold ?? 0),
      });
      pass.__updateScenePass = () => {
        pass.enabled = effectConfig.enabled !== false;
        pass.updateOptions({
          exposure: Number(props.exposure ?? 1),
          strength: Number(props.strength ?? 1.5),
          radius: Number(props.radius ?? 0),
          threshold: Number(props.threshold ?? 0),
        });
      };
      pass.__updateScenePass();
      return pass;
    }
    case 'GlitchEffect': {
      const pass = new GlitchPass();
      return attachUpdater(pass, frameData => {
        pass.updateOptions(
          {
            ...props,
            mode: props.mode || 'Sporadic',
          },
          frameData,
        );
        pass.enabled = effectConfig.enabled !== false && pass.enabled;
      });
    }
    case 'BrightnessContrastEffect':
      return createBrightnessContrastPass(effectConfig, props);
    case 'ColorAverageEffect':
      return createColorAveragePass(effectConfig);
    case 'ColorEffect': {
      const colorEffects = [];

      colorEffects.push(createBrightnessContrastPass(effectConfig, props));
      if (props.colorAverageEnabled) {
        colorEffects.push(createColorAveragePass(effectConfig));
      }
      if (props.colorDepthEnabled) {
        colorEffects.push(createColorDepthPass(effectConfig, props));
      }
      colorEffects.push(createHueSaturationPass(effectConfig, props));
      colorEffects.push(createSepiaPass(effectConfig, props));
      if (props.toneMappingEnabled) {
        colorEffects.push(createToneMappingPass(effectConfig, props));
      }

      return colorEffects;
    }
    case 'ColorDepthEffect':
      return createColorDepthPass(effectConfig, props);
    case 'HueSaturationEffect':
      return createHueSaturationPass(effectConfig, props);
    case 'ScanlineEffect': {
      const pass = new ShaderPass(ScanlineShader);
      return attachUpdater(pass, () => {
        pass.enabled = effectConfig.enabled !== false;
        pass.setUniforms({
          density: Number(props.density ?? 1.25),
        });
      });
    }
    case 'SepiaEffect':
      return createSepiaPass(effectConfig, props);
    case 'ToneMappingEffect':
      return createToneMappingPass(effectConfig, props);
    case 'VignetteEffect': {
      const pass = new ShaderPass(VignetteShader);
      return attachUpdater(pass, () => {
        pass.enabled = effectConfig.enabled !== false;
        pass.setUniforms({
          offset: Number(props.offset ?? 0.5),
          darkness: Number(props.darkness ?? 0.5),
        });
      });
    }
    case 'ASCIIEffect': {
      const pass = new AsciiPass({
        cellSize: Number(props.cellSize ?? 16),
        fontSize: Number(props.fontSize ?? 54),
        invert: !!props.invert,
      });
      return attachUpdater(pass, () => {
        pass.enabled = effectConfig.enabled !== false;
        pass.updateOptions({
          cellSize: Number(props.cellSize ?? 16),
          fontSize: Number(props.fontSize ?? 54),
          invert: props.invert ? 1 : 0,
        });
      });
    }
    case 'TiltShiftEffect': {
      const pass = new ShaderPass(TiltShiftShader);
      return attachUpdater(pass, () => {
        pass.enabled = effectConfig.enabled !== false;
        pass.setUniforms({
          blur: Number(props.blur ?? 0.15),
          taper: Number(props.taper ?? 0.5),
          start: [0.5, 0.0],
          end: [0.5, 1.0],
          samples: Number(props.samples ?? 10),
          direction: [1, 1],
        });
      });
    }
    default:
      return null;
  }
}

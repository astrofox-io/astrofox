import ShaderPass from '../../composer/ShaderPass';
import { toRadians } from '../../constants';
import { attachPassUpdater, type EffectPassConfig, isEffectEnabled } from '../effectPassRegistry';
import {
  BrightnessContrastShader,
  ColorAverageShader,
  ColorDepthShader,
  HueSaturationShader,
  SepiaShader,
  ToneMappingShader,
} from '../shaders/PostEffectShaders';

/**
 * Single-shader color passes. Each is both a standalone effect and a stage
 * of the combined ColorEffect, so the factories are shared here.
 */

export function createBrightnessContrastPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(BrightnessContrastShader);
  return attachPassUpdater(pass, () => {
    const brightness = Number(props.brightness ?? 0);
    const contrast = Number(props.contrast ?? 0);
    pass.enabled =
      isEffectEnabled(effect) && (Math.abs(brightness) > 0.0001 || Math.abs(contrast) > 0.0001);
    pass.setUniforms({ brightness, contrast });
  });
}

export function createColorAveragePass(effect: EffectPassConfig) {
  const pass = new ShaderPass(ColorAverageShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
  });
}

export function createColorDepthPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(ColorDepthShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({ bits: Number(props.bits ?? 16) });
  });
}

export function createHueSaturationPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(HueSaturationShader);
  return attachPassUpdater(pass, () => {
    const hue = toRadians(Number(props.hue ?? 0));
    const saturation = Number(props.saturation ?? 0);
    pass.enabled =
      isEffectEnabled(effect) && (Math.abs(hue) > 0.0001 || Math.abs(saturation) > 0.0001);
    pass.setUniforms({ hue, saturation });
  });
}

export function createSepiaPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(SepiaShader);
  return attachPassUpdater(pass, () => {
    const intensity = Number(props.intensity ?? 0);
    pass.enabled = isEffectEnabled(effect) && Math.abs(intensity) > 0.0001;
    pass.setUniforms({ intensity });
  });
}

export function createToneMappingPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(ToneMappingShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      adaptive: (props.toneMappingAdaptive ?? props.adaptive ?? false) ? 1 : 0,
      middleGrey: Number(props.middleGrey ?? 0.6),
      maxLuminance: Number(props.maxLuminance ?? 16),
      averageLuminance: Number(props.averageLuminance ?? 1),
      adaptationRate: Number(props.adaptationRate ?? 1),
    });
  });
}

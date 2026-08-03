// @ts-nocheck
import {
  ClampToEdgeWrapping,
  DataTexture,
  NearestFilter,
  RGBAFormat,
  UnsignedByteType,
} from 'three';
import ShaderPass from '../../composer/ShaderPass';
import GlitchShader from '../shaders/GlitchShader';

function createNoiseTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);

  for (let index = 0; index < data.length; index += 4) {
    data[index] = Math.floor(Math.random() * 255);
    data[index + 1] = Math.floor(Math.random() * 255);
    data[index + 2] = Math.floor(Math.random() * 255);
    data[index + 3] = 255;
  }

  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

export default class GlitchPass extends ShaderPass {
  constructor() {
    super(GlitchShader);

    this.displacementTexture = createNoiseTexture();
    this.setUniforms({
      displacementTexture: this.displacementTexture,
    });
  }

  updateOptions(props, frameData) {
    const nextProps = props || {};
    const strength = Number(nextProps.strength ?? 0.3);
    const shouldAnimate = nextProps.mode === 'Constant' || Boolean(frameData?.hasUpdate);

    this.enabled = shouldAnimate && strength > 0;
    if (!this.enabled) {
      return;
    }

    const ratio = Number(nextProps.ratio ?? 0.85);
    this.setUniforms({
      shift: strength * 0.08,
      angle: Math.random() * Math.PI * 2,
      seed: Math.max(Math.random(), 0.02),
      seed_x: (Math.random() - 0.5) * 2,
      seed_y: (Math.random() - 0.5) * 2,
      distortion_x: Math.random(),
      distortion_y: Math.random(),
      col_s: Number(nextProps.columns ?? 0.05),
      horizontal: Math.random() < ratio ? 1 : 0,
      vertical: Math.random() < ratio ? 1 : 0,
    });
  }

  dispose() {
    this.displacementTexture?.dispose?.();
    super.dispose();
  }
}

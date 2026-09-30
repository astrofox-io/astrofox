// @ts-nocheck
import {
  ClampToEdgeWrapping,
  DataTexture,
  NearestFilter,
  RGBAFormat,
  UnsignedByteType,
} from 'three';
import { frameSeed, seededRandom } from '@/lib/utils/random';
import ShaderPass from '../../composer/ShaderPass';
import GlitchShader from '../shaders/GlitchShader';

const NOISE_SEED = 0x9e3779b9;
let instances = 0;

function createNoiseTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);
  const random = seededRandom(NOISE_SEED);

  for (let index = 0; index < data.length; index += 4) {
    data[index] = Math.floor(random() * 255);
    data[index + 1] = Math.floor(random() * 255);
    data[index + 2] = Math.floor(random() * 255);
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

    // Two glitch effects on one frame glitch differently.
    this.salt = ++instances;
    this.displacementTexture = createNoiseTexture();
    this.setUniforms({
      displacementTexture: this.displacementTexture,
    });
  }

  updateOptions(props, frameData) {
    const nextProps = props || {};
    const strength = Number(nextProps.strength ?? 0.3);
    const shouldAnimate = nextProps.mode === 'Constant' || Boolean(frameData?.playing);

    this.enabled = shouldAnimate && strength > 0;
    if (!this.enabled) {
      return;
    }

    const ratio = Number(nextProps.ratio ?? 0.85);
    // Random per frame of project time, so a frame glitches the same way
    // live, in a preview and in an export.
    const random = seededRandom(
      frameSeed(Number(frameData?.time) || 0, Number(frameData?.fps) || 30, this.salt),
    );
    this.setUniforms({
      shift: strength * 0.08,
      angle: random() * Math.PI * 2,
      seed: Math.max(random(), 0.02),
      seed_x: (random() - 0.5) * 2,
      seed_y: (random() - 0.5) * 2,
      distortion_x: random(),
      distortion_y: random(),
      col_s: Number(nextProps.columns ?? 0.05),
      horizontal: random() < ratio ? 1 : 0,
      vertical: random() < ratio ? 1 : 0,
    });
  }

  dispose() {
    this.displacementTexture?.dispose?.();
    super.dispose();
  }
}

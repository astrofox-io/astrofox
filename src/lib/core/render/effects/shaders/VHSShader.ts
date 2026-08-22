// @ts-nocheck

import { Vector2, Vector3 } from 'three';
import fragmentShader from '@/lib/shaders/glsl/fragment/vhs.glsl';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    time: { type: 'f', value: 0.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
    wave: { type: 'f', value: 1.0 },
    jitter: { type: 'f', value: 0.25 },
    crease: { type: 'f', value: 0.1 },
    switching: { type: 'f', value: 0.05 },
    switchingHeight: { type: 'f', value: 0.02 },
    bloom: { type: 'f', value: 0.4 },
    aberration: { type: 'f', value: 2.0 },
    acBeat: { type: 'f', value: 1.0 },
    grain: { type: 'f', value: 0.1 },
    scanlines: { type: 'f', value: 0.1 },
    vignette: { type: 'f', value: 0.0 },
    barrel: { type: 'f', value: 0.0 },
    saturation: { type: 'f', value: 1.0 },
    exposure: { type: 'f', value: 1.0 },
    creaseNoise: { type: 'f', value: 0.0 },
    bezel: { type: 'v3', value: new Vector3(0, 0, 0) },
  },
  vertexShader,
  fragmentShader,
};

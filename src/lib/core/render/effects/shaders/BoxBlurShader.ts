// @ts-nocheck

import { Vector2 } from 'three';
import fragmentShader from '@/lib/shaders/glsl/fragment/box-blur.glsl';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    amount: { type: 'f', value: 0.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};

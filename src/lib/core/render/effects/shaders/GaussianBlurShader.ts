// @ts-nocheck

import { Vector2 } from 'three';
import fragmentShader from '@/lib/shaders/glsl/fragment/gaussian-blur.glsl';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    direction: { type: 'v2', value: new Vector2(0, 1) },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};

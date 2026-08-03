// @ts-nocheck

import { Vector2 } from 'three';
import fragmentShader from '@/lib/shaders/glsl/fragment/hexagon.glsl';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    center: { type: 'v2', value: new Vector2(0.5, 0.5) },
    size: { type: 'f', value: 10.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};

import { Vector2 } from 'three';
import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/GaussianBlur.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    direction: { type: 'v2', value: new Vector2(0, 1) },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },

  vertexShader,
  fragmentShader,
};

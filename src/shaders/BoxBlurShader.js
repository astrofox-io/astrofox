import { Vector2 } from 'three';
import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/box-blur.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    amount: { type: 'f', value: 0.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};

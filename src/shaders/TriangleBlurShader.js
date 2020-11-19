import { Vector2 } from 'three';
import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/triangle-blur.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    delta: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};

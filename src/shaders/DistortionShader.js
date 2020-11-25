import { Vector2 } from 'three';
import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/distortion.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    time: { type: 'f', value: 1.0 },
    amount: { type: 'f', value: 1.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};

import { Vector2 } from 'three';
import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/dot-screen.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    tSize: { type: 'v2', value: new Vector2(256, 256) },
    center: { type: 'v2', value: new Vector2(0.5, 0.5) },
    angle: { type: 'f', value: 1.57 },
    scale: { type: 'f', value: 1.0 },
  },

  vertexShader,
  fragmentShader,
};

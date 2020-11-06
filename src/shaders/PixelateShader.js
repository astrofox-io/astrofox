import { Vector2 } from 'three';
import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/Pixelate.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    size: { type: 'f', value: 10 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },

  vertexShader,
  fragmentShader,
};

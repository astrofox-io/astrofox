import { Color } from 'three';
import vertexShader from 'glsl/vertex/Point.glsl';
import fragmentShader from 'glsl/fragment/Point.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    opacity: { type: 'f', value: 1.0 },
    color: { type: 'c', value: new Color(0xffffff) },
  },

  vertexShader,
  fragmentShader,
  alphaTest: 0.9,
};

import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/mirror.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    side: { type: 'i', value: 1 },
  },

  vertexShader,
  fragmentShader,
};

import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/grid.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
  },

  vertexShader,
  fragmentShader,
};

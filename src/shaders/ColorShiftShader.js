import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/ColorShift.glsl';

export default {
  uniforms: {
    time: { type: 'f', value: 1.0 },
  },

  vertexShader,
  fragmentShader,
};

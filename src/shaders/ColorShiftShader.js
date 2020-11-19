import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/color-shift.glsl';

export default {
  uniforms: {
    time: { type: 'f', value: 1.0 },
  },

  vertexShader,
  fragmentShader,
};

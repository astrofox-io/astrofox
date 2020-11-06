import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/RGBShift.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    amount: { type: 'f', value: 0.005 },
    angle: { type: 'f', value: 0.0 },
  },

  vertexShader,
  fragmentShader,
};

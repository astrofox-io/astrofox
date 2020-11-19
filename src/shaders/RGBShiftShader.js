import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/rgb-shift.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    amount: { type: 'f', value: 0.005 },
    angle: { type: 'f', value: 0.0 },
  },
  vertexShader,
  fragmentShader,
};

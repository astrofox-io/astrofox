import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/copy.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    opacity: { type: 'f', value: 1.0 },
    alpha: { type: 'i', value: 0 },
  },
  vertexShader,
  fragmentShader,
};

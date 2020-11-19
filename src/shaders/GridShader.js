import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/grid.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
  },
  vertexShader,
  fragmentShader,
};

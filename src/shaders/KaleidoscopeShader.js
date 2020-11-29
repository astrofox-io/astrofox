import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/kaleidoscope.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    sides: { type: 'f', value: 0 },
    angle: { type: 'f', value: 0 },
  },
  vertexShader,
  fragmentShader,
};

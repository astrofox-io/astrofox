import vertex from 'glsl/vertex/Basic.glsl';
import fragment from 'glsl/fragment/ColorShift.glsl';

export default {
  uniforms: {
    time: { type: 'f', value: 1.0 },
  },

  vertexShader: vertex,
  fragmentShader: fragment,
};

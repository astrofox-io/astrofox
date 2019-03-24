import vertex from 'glsl/vertex/Basic.glsl';
import fragment from 'glsl/fragment/Grid.glsl';

export default {
  uniforms: {
    tDiffuse: { type: 't', value: null },
  },

  vertexShader: vertex,
  fragmentShader: fragment,
};

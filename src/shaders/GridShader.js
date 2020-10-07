import vertex from 'glsl/vertex/basic.glsl';
import fragment from 'glsl/fragment/grid.glsl';

export default {
  uniforms: {
    tDiffuse: { type: 't', value: null },
  },

  vertexShader: vertex,
  fragmentShader: fragment,
};

import vertex from 'glsl/vertex/basic.glsl';
import fragment from 'glsl/fragment/mirror.glsl';

export default {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    side: { type: 'i', value: 1 },
  },

  vertexShader: vertex,
  fragmentShader: fragment,
};

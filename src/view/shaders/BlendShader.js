import vertex from 'glsl/vertex/basic.glsl';
import fragment from 'glsl/fragment/Blend.glsl';

export default {
  uniforms: {
    tBase: { type: 't', value: null },
    tBlend: { type: 't', value: null },
    mode: { type: 'i', value: 0 },
    alpha: { type: 'i', value: 0 },
    opacity: { type: 'f', value: 1.0 },
    mask: { type: 'i', value: 0 },
    inverse: { type: 'i', value: 0 },
  },

  vertexShader: vertex,
  fragmentShader: fragment,
};

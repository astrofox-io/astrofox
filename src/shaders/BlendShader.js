import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/Blend.glsl';

export default {
  uniforms: {
    baseBuffer: { type: 't', value: null },
    blendBuffer: { type: 't', value: null },
    mode: { type: 'i', value: 0 },
    alpha: { type: 'i', value: 0 },
    opacity: { type: 'f', value: 1.0 },
    mask: { type: 'i', value: 0 },
    inverse: { type: 'i', value: 0 },
  },

  vertexShader,
  fragmentShader,
};

// @ts-nocheck
import fragmentShader from '@/lib/shaders/glsl/fragment/lens-warp.glsl';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    warp: { type: 'f', value: 0.0 },
  },
  vertexShader,
  fragmentShader,
};

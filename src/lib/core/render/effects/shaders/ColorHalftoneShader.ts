// @ts-nocheck
import fragmentShader from '@/lib/shaders/glsl/fragment/color-halftone.glsl';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

export default {
  uniforms: {
    inputTexture: { value: null },
    shape: { value: 1 },
    radius: { value: 4 },
    rotateR: { value: Math.PI / 12 },
    rotateG: { value: (Math.PI / 12) * 2 },
    rotateB: { value: (Math.PI / 12) * 3 },
    scatter: { value: 0 },
    width: { value: 1 },
    height: { value: 1 },
  },
  vertexShader,
  fragmentShader,
};

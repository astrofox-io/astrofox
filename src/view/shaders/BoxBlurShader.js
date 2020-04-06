import { Vector2 } from 'three';
import vertex from 'glsl/vertex/basic.glsl';
import fragment from 'glsl/fragment/BoxBlur.glsl';

export default {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    amount: { type: 'f', value: 1.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },

  vertexShader: vertex,
  fragmentShader: fragment,
};

import { Vector2 } from 'three';
import vertex from 'glsl/vertex/Basic.glsl';
import fragment from 'glsl/fragment/Hexagon.glsl';

export default {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    center: { type: 'v2', value: new Vector2(0.5, 0.5) },
    size: { type: 'f', value: 10.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },

  vertexShader: vertex,
  fragmentShader: fragment,
};

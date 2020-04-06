import { Vector2 } from 'three';
import vertex from 'glsl/vertex/basic.glsl';
import fragment from 'glsl/fragment/led.glsl';

export default {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    spacing: { type: 'f', value: 10.0 },
    size: { type: 'f', value: 4.0 },
    blur: { type: 'f', value: 4.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },

  vertexShader: vertex,
  fragmentShader: fragment,
};

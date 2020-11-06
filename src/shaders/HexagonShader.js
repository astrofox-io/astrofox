import { Vector2 } from 'three';
import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/hexagon.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    center: { type: 'v2', value: new Vector2(0.5, 0.5) },
    size: { type: 'f', value: 10.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },

  vertexShader,
  fragmentShader,
};

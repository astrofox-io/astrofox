import { Vector2 } from 'three';
import vertexShader from 'glsl/vertex/basic.glsl';
import fragmentShader from 'glsl/fragment/led.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    spacing: { type: 'f', value: 10.0 },
    size: { type: 'f', value: 4.0 },
    blur: { type: 'f', value: 4.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },

  vertexShader,
  fragmentShader,
};

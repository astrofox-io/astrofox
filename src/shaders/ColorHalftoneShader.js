import { Vector2 } from 'three';
import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/color-halftone.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    angle: { type: 'f', value: 1.0 },
    scale: { type: 'f', value: 1.0 },
    center: { type: 'v2', value: new Vector2(0, 0) },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};

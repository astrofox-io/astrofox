import { Vector2 } from 'three';
import vertexShader from 'shaders/glsl/vertex/basic.glsl';
import fragmentShader from 'shaders/glsl/fragment/halftone.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    center: { type: 'v2', value: new Vector2(0.5, 0.5) },
    angle: { type: 'f', value: 1.57 },
    scale: { type: 'f', value: 1.0 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};

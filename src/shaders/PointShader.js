import { Color } from 'three';
import vertexShader from 'shaders/glsl/vertex/point.glsl';
import fragmentShader from 'shaders/glsl/fragment/point.glsl';

export default {
  uniforms: {
    inputBuffer: { type: 't', value: null },
    opacity: { type: 'f', value: 1.0 },
    color: { type: 'c', value: new Color(0xffffff) },
  },
  vertexShader,
  fragmentShader,
  alphaTest: 0.9,
};

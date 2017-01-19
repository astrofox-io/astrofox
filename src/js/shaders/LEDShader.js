import { Vector2 } from 'three';
import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        spacing: { type: 'f', value: 10.0 },
        size: { type: 'f', value: 4.0 },
        blur: { type: 'f', value: 4.0 },
        resolution: { type: 'v2', value: new Vector2(854, 480) }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.LED
};
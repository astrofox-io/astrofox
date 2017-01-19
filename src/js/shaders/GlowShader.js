import { Vector2 } from 'three';
import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 1.0 },
        intensity: { type: 'f', value: 1.0 },
        resolution: { type: 'v2', value: new Vector2(854, 480) }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.Glow
};
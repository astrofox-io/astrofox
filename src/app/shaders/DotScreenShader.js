import { Vector2 } from 'three';
import vertex from 'glsl/vertex/Basic.glsl';
import fragment from 'glsl/fragment/DotScreen.glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        tSize: { type: 'v2', value: new Vector2(256, 256) },
        center: { type: 'v2', value: new Vector2(0.5, 0.5) },
        angle: { type: 'f', value: 1.57 },
        scale: { type: 'f', value: 1.0 },
    },

    vertexShader: vertex,
    fragmentShader: fragment,
};

import { Vector2 } from 'three';
import vertex from 'glsl/vertex/Basic';
import fragment from 'glsl/fragment/GaussianBlur';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        direction: { type: 'v2', value: new Vector2(0, 1) },
        resolution: { type: 'v2', value: new Vector2(1, 1) }
    },

    vertexShader: vertex,
    fragmentShader: fragment
};
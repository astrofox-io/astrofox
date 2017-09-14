import { Vector2 } from 'three';
import vertex from 'glsl/vertex/Basic';
import fragment from 'glsl/fragment/ZoomBlur';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        center: { type: 'v2', value: new Vector2(0.5, 0.5) },
        amount: { type: 'f', value: 1.0 },
        resolution: { type: 'v2', value: new Vector2(1, 1) }
    },

    vertexShader: vertex,
    fragmentShader: fragment
};
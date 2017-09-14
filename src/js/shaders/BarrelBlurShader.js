import { Vector2 } from 'three';
import vertex from 'glsl/vertex/Basic';
import fragment from 'glsl/fragment/BarrelBlur';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        resolution: { type: 'v2', value: new Vector2(1, 1) }
    },

    vertexShader: vertex,
    fragmentShader: fragment
};
import { Vector2 } from 'three';
import vertex from 'glsl/vertex/Basic.glsl';
import fragment from 'glsl/fragment/FXAA.glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        resolution: { type: 'v2', value: new Vector2(1, 1) },
    },

    vertexShader: vertex,
    fragmentShader: fragment,
};

import { Color } from 'three';
import vertex from 'glsl/vertex/Point';
import fragment from 'glsl/fragment/Point';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        opacity: { type: 'f', value: 1.0 },
        color: { type: 'c', value: new Color(0xffffff) }
    },

    vertexShader: vertex,
    fragmentShader: fragment,
    alphaTest: 0.9
};
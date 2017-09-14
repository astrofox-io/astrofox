import vertex from 'glsl/vertex/Basic';
import fragment from 'glsl/fragment/Luminance';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.0 }
    },

    vertexShader: vertex,
    fragmentShader: fragment
};
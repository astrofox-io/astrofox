import vertex from 'glsl/vertex/Basic';
import fragment from 'glsl/fragment/Grid';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null }
    },

    vertexShader: vertex,
    fragmentShader: fragment
};
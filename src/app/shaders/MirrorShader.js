import vertex from 'glsl/vertex/Basic.glsl';
import fragment from 'glsl/fragment/Mirror.glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        side: { type: 'i', value: 1 },
    },

    vertexShader: vertex,
    fragmentShader: fragment,
};

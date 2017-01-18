import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.Grid
};
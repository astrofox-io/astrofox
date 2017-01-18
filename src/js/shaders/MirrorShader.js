import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: {type: 't', value: null},
        side: {type: 'i', value: 1}
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.Mirror
};
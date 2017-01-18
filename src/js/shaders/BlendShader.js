import glsl from '../lib/glsl';

export default {
    uniforms: {
        tBase: { type: 't', value: null },
        tBlend: { type: 't', value: null },
        mode: { type: 'i', value: 0 },
        alpha: { type: 'i', value: 0 },
        opacity: { type: 'f', value: 1.0 }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.Blend
};
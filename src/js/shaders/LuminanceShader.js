import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.0 }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.Luminance
};
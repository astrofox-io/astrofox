import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        opacity: { type: 'f', value: 1.0 },
        alpha: { type: 'i', value: 0 }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.Copy
};
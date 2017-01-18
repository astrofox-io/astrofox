import glsl from '../lib/glsl';

export default {
    uniforms: {
        time: { type: 'f', value: 1.0 }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.ColorShift
};
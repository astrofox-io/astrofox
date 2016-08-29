const THREE = require('three');
const ShaderCode = require('../lib/ShaderCode');

module.exports = {
    uniforms: {
        tBase: { type: 't', value: null },
        tBlend: { type: 't', value: null },
        mode: { type: 'i', value: 0 },
        alpha: { type: 'i', value: 0 },
        opacity: { type: 'f', value: 1.0 }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Blend
};
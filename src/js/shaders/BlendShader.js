var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

var BlendShader = {
    uniforms: {
        tBase: { type: 't', value: null },
        tBlend: { type: 't', value: null },
        mode: { type: 'i', value: 1 },
        opacity: { type: 'f', value: 1.0 }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Blend
};

module.exports = BlendShader;
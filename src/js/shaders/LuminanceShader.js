var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

var LuminanceShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.0 }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Luminance
};

module.exports = LuminanceShader;
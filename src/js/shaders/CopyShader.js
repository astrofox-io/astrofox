var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

var CopyShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        opacity: { type: 'f', value: 1.0 },
        alpha: { type: 'i', value: 0 }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Copy
};

module.exports = CopyShader;
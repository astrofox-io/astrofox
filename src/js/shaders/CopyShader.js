var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var CopyShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        opacity:  { type: "f", value: 1.0 }
    },

    vertexShader: ShaderCode.vertex.basic,
    fragmentShader: ShaderCode.fragment.copy
};

module.exports = CopyShader;
var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var GridShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null }
    },

    vertexShader: ShaderCode.vertex.basic,
    fragmentShader: ShaderCode.fragment.grid
};

module.exports = GridShader;
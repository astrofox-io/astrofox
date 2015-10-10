var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var GridShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Grid
};

module.exports = GridShader;
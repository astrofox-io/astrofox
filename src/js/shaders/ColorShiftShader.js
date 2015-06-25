var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var ColorShiftShader = {
    uniforms: {
        time: { type: 'f', value: 1.0 }
    },

    vertexShader: ShaderCode.vertex.basic,
    fragmentShader: ShaderCode.fragment.color_shift
};

module.exports = ColorShiftShader;
const THREE = require('three');
const ShaderCode = require('./ShaderCode.js');

module.exports = {
    uniforms: {
        time: { type: 'f', value: 1.0 }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.ColorShift
};
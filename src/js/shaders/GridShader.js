const THREE = require('three');
const ShaderCode = require('../lib/ShaderCode');

module.exports = {
    uniforms: {
        tDiffuse: { type: "t", value: null }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Grid
};
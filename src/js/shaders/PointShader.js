var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

module.exports = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        color: { type: "c", value: new THREE.Color(0xffffff) }
    },

    vertexShader: ShaderCode.vertex.Point,
    fragmentShader: ShaderCode.fragment.Point,
    alphaTest: 0.9
};
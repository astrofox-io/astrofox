var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var BlurShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        delta: { type: 'v2', value: new THREE.Vector2(1, 1) },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.basic,
    fragmentShader: ShaderCode.fragment.blur
};

module.exports = BlurShader;
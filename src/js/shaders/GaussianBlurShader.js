var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var GaussianBlurShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        direction: { type: 'v2', value: new THREE.Vector2(0, 1) },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.GaussianBlur
};

module.exports = GaussianBlurShader;
var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

var GaussianBlurShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        direction: { type: 'v2', value: new THREE.Vector2(0, 1) },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) },
        flip: { type: 'i', value: 0 }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.GaussianBlur
};

module.exports = GaussianBlurShader;
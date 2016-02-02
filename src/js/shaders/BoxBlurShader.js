var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

var BoxBlurShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'v2', value: new THREE.Vector2(1, 1) },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.BoxBlur
};

module.exports = BoxBlurShader;
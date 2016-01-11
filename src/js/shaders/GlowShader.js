var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var GlowShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 1.0 },
        size: { type: 'f', value: 1.0 },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Glow
};

module.exports = GlowShader;
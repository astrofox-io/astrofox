const THREE = require('three');
const ShaderCode = require('../lib/ShaderCode');

module.exports = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        center: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) },
        amount: { type: 'f', value: 1.0 },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.ZoomBlur
};
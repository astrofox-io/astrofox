const THREE = require('three');
const ShaderCode = require('./ShaderCode.js');

module.exports = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.BarrelBlur
};
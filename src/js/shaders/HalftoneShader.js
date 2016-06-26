const THREE = require('three');
const ShaderCode = require('./ShaderCode.js');

module.exports = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        center: { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
        angle: { type: "f", value: 1.57 },
        scale: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Halftone
};
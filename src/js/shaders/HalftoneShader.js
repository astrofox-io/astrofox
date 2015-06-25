var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var HalftoneShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        center: { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
        angle: { type: "f", value: 1.57 },
        scale: { type: "f", value: 1.0 },
        tSize: { type: "v2", value: new THREE.Vector2(256, 256) }
    },

    vertexShader: ShaderCode.vertex.basic,
    fragmentShader: ShaderCode.fragment.halftone
};

module.exports = HalftoneShader;
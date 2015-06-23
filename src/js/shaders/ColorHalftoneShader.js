var THREE = require('three');
var glslify = require('glslify');

var HalftoneShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        center: { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
        angle: { type: "f", value: 1.57 },
        scale: { type: "f", value: 1.0 },
        tSize: { type: "v2", value: new THREE.Vector2(256, 256) }
    },

    vertexShader: glslify('./glsl/basic.vertex.glsl'),
    fragmentShader: glslify('./glsl/color-halftone.fragment.glsl')
};

module.exports = HalftoneShader;
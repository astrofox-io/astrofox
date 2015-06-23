var THREE = require('three');
var glslify = require('glslify');

var HexagonPixelateShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        center: { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
        scale: { type: "f", value: 2.0 },
        tSize: { type: "v2", value: new THREE.Vector2(256, 256) }
    },

    vertexShader: glslify('./glsl/basic.vertex.glsl'),
    fragmentShader: glslify('./glsl/hexagon-pixelate.fragment.glsl')
};

module.exports = HexagonPixelateShader;
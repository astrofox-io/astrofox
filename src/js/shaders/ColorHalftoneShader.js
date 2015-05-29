var fs = require('fs');
var THREE = require('three');

var HalftoneShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        center: { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
        angle: { type: "f", value: 1.57 },
        scale: { type: "f", value: 1.0 },
        tSize: { type: "v2", value: new THREE.Vector2(256, 256) }
    },

    vertexShader: fs.readFileSync(__dirname + '/glsl/basic.vertex.glsl', 'utf8'),
    fragmentShader: fs.readFileSync(__dirname + '/glsl/color-halftone.fragment.glsl', 'utf8')
};

module.exports = HalftoneShader;
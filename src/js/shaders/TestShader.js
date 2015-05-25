var fs = require('fs');
var THREE = require('three');

var TestShader = {
    uniforms: {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() }
    },

    vertexShader: fs.readFileSync(__dirname + '/../../glsl/basic.vertex.glsl', 'ascii'),
    fragmentShader: fs.readFileSync(__dirname + '/../../glsl/color-shift.fragment.glsl', 'ascii')
};

module.exports = TestShader;
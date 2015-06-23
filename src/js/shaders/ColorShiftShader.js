var THREE = require('three');
var glslify = require('glslify');

var ColorShiftShader = {
    uniforms: {
        time: { type: 'f', value: 1.0 }
    },

    vertexShader: glslify('./glsl/basic.vertex.glsl'),
    fragmentShader: glslify('./glsl/color-shift.fragment.glsl')
};

module.exports = ColorShiftShader;
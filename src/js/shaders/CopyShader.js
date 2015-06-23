var THREE = require('three');
var glslify = require('glslify');

var CopyShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        opacity:  { type: "f", value: 1.0 }
    },

    vertexShader: glslify('./glsl/basic.vertex.glsl'),
    fragmentShader: glslify('./glsl/copy.fragment.glsl')
};

module.exports = CopyShader;
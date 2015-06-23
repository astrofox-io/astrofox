var THREE = require('three');
var glslify = require('glslify');

var GridShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null }
    },

    vertexShader: glslify('./glsl/grid.vertex.glsl'),
    fragmentShader: glslify('./glsl/grid.fragment.glsl')
};

module.exports = GridShader;
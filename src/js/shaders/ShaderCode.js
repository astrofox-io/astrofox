var THREE = require('three');
var glslify = require('glslify');

var ShaderCode = {
    vertex: {
        basic: glslify('./glsl/basic.vertex.glsl'),
        crosshatch: glslify('./glsl/crosshatch.vertex.glsl'),
        hatch_glow: glslify('./glsl/hatch_glow.vertex.glsl')
    },
    fragment: {
        color_shift: glslify('./glsl/color_shift.fragment.glsl'),
        copy: glslify('./glsl/copy.fragment.glsl'),
        copy_alpha: glslify('./glsl/copy_alpha.fragment.glsl'),
        crosshatch: glslify('./glsl/crosshatch.fragment.glsl'),
        dot_screen: glslify('./glsl/dot_screen.fragment.glsl'),
        dot_matrix: glslify('./glsl/dot_matrix.fragment.glsl'),
        glow_chroma: glslify('./glsl/glow_chroma.fragment.glsl'),
        grid: glslify('./glsl/grid.fragment.glsl'),
        halftone: glslify('./glsl/halftone.fragment.glsl'),
        hatch_glow: glslify('./glsl/hatch_glow.fragment.glsl'),
        hexagon: glslify('./glsl/hexagon.fragment.glsl'),
        mirror: glslify('./glsl/mirror.fragment.glsl'),
        rgb_shift: glslify('./glsl/rgb_shift.fragment.glsl')
    }
};

module.exports = ShaderCode;
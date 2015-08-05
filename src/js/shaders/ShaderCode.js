var THREE = require('three');
var glslify = require('glslify');

var ShaderCode = {
    vertex: {
        basic: glslify('../../glsl/vertex/basic.glsl'),
        crosshatch: glslify('../../glsl/vertex/crosshatch.glsl'),
        hatch_glow: glslify('../../glsl/vertex/hatch_glow.glsl')
    },
    fragment: {
        blur: glslify('../../glsl/fragment/blur.glsl'),
        color_shift: glslify('../../glsl/fragment/color_shift.glsl'),
        copy: glslify('../../glsl/fragment/copy.glsl'),
        copy_alpha: glslify('../../glsl/fragment/copy_alpha.glsl'),
        crosshatch: glslify('../../glsl/fragment/crosshatch.glsl'),
        dot_screen: glslify('../../glsl/fragment/dot_screen.glsl'),
        dot_matrix: glslify('../../glsl/fragment/dot_matrix.glsl'),
        glow_chroma: glslify('../../glsl/fragment/glow_chroma.glsl'),
        grid: glslify('../../glsl/fragment/grid.glsl'),
        halftone: glslify('../../glsl/fragment/halftone.glsl'),
        hatch_glow: glslify('../../glsl/fragment/hatch_glow.glsl'),
        hexagon: glslify('../../glsl/fragment/hexagon.glsl'),
        mirror: glslify('../../glsl/fragment/mirror.glsl'),
        rgb_shift: glslify('../../glsl/fragment/rgb_shift.glsl')
    }
};

module.exports = ShaderCode;
var ShaderLibrary = {
    copy: require('./CopyShader.js'),
    depth: require('./DepthShader.js'),
    dot_screen: require('./DotScreenShader.js'),
    dot_matrix: require('./DotMatrixShader.js'),
    grid: require('./GridShader.js'),
    halftone: require('./HalftoneShader.js'),
    hatch_glow: require('./HatchGlowShader.js'),
    hexagon: require('./HexagonShader.js'),
    mirror: require('./MirrorShader.js'),
    rgb_shift: require('./RGBShiftShader.js')
};

module.exports = ShaderLibrary;
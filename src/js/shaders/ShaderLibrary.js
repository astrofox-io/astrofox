var ShaderLibrary = {
    Copy: require('./CopyShader.js'),
    Depth: require('./DepthShader.js'),
    DotScreen: require('./DotScreenShader.js'),
    LED: require('./LEDShader.js'),
    Grid: require('./GridShader.js'),
    Halftone: require('./HalftoneShader.js'),
    HatchGlow: require('./HatchGlowShader.js'),
    Hexagon: require('./HexagonShader.js'),
    Mirror: require('./MirrorShader.js'),
    RGBShift: require('./RGBShiftShader.js')
};

module.exports = ShaderLibrary;
var ShaderLibrary = {
    Copy: require('./CopyShader.js'),
    Depth: require('./DepthShader.js'),
    DotScreen: require('./DotScreenShader.js'),
    Grid: require('./GridShader.js'),
    Halftone: require('./HalftoneShader.js'),
    Hexagon: require('./HexagonShader.js'),
    LED: require('./LEDShader.js'),
    Mirror: require('./MirrorShader.js'),
    Pixelate: require('./PixelateShader.js'),
    RGBShift: require('./RGBShiftShader.js')
};

module.exports = ShaderLibrary;
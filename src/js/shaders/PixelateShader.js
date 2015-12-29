var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var PixelateShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 100 },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Pixelate
};

module.exports = PixelateShader;
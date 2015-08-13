var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var LEDShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        spacing: { type: 'f', value: 10.0 },
        size: { type: 'f', value: 4.0 },
        blur: { type: 'f', value: 4.0 },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.basic,
    fragmentShader: ShaderCode.fragment.led
};

module.exports = LEDShader;
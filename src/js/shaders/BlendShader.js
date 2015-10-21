var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var BlendShader = {
    uniforms: {
        tInput: { type: 't', value: null },
        tInput2: { type: 't', value: null },
        mode: { type: 'i', value: 1 },
        opacity: { type: 'f', value: 1.0 },
        sizeMode: { type: 'i', value: 0 },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) },
        resolution2: { type: 'v2', value: new THREE.Vector2(854, 480) },
        aspectRatio: { type: 'f', value: 854/480 },
        aspectRatio2: { type: 'f', value: 854/480 }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.Blend
};

module.exports = BlendShader;
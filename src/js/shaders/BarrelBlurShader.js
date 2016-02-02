'use strict';

var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

var BarrelBlurShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.BarrelBlur
};

module.exports = BarrelBlurShader;
'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('core/Class.js');
var ShaderPass = require('graphics/ShaderPass.js');
var BlendShader = require('shaders/BlendShader.js');
var BlendModes = require('graphics/BlendModes.js');

var defaults = {
    transparent: true,
    needsSwap: true,
    opacity: 1.0,
    blending: 'Screen',
    multiplyAlpha: false
};

var BlendPass = function(buffer, options) {
    ShaderPass.call(this, BlendShader, _.assign({}, defaults, options));

    this.material.blending = THREE.NoBlending;

    this.buffer = buffer;
};

Class.extend(BlendPass, ShaderPass, {
    process: function(renderer, writeBuffer, readBuffer) {
        this.material.uniforms['tInput'].value = readBuffer;
        this.material.uniforms['tInput2'].value = this.buffer;

        this.mesh.material = this.material;

        this.render(renderer, this.scene, this.camera, writeBuffer);
    }
});

module.exports = BlendPass;
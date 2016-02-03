'use strict';

var _ = require('lodash');
var Effect = require('../effects/Effect.js');
var DotScreenShader = require('../shaders/DotScreenShader.js');

var defaults = {
    angle: 90,
    scale: 1.0
};

var RADIANS = 0.017453292519943295;

var DotScreenEffect = function(options) {
    Effect.call(this, 'DotScreenEffect', defaults);

    this.update(options);
};

DotScreenEffect.info = {
    name: 'Dot Screen'
};

DotScreenEffect.prototype = _.create(Effect.prototype, {
    constructor: DotScreenEffect,

    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(DotScreenShader);
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        var options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({
                scale: options.scale,
                angle: options.angle * RADIANS
            });
            this.hasUpdate = false;
        }
    }
});

module.exports = DotScreenEffect;
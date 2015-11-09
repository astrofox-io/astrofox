'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var DotScreenShader = require('shaders/DotScreenShader.js');

var defaults = {
    angle: 90,
    scale: 1.0
};

var RADIANS = 0.017453292519943295;

var DotScreenEffect = function(options) {
    Effect.call(this, 'DotScreenEffect', defaults);

    this.shader = DotScreenShader;

    this.update(options);
};

DotScreenEffect.info = {
    name: 'Dot Screen'
};

Class.extend(DotScreenEffect, Effect, {
    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(this.shader);
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
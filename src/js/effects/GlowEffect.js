'use strict';

var Class = require('../core/Class.js');
var Effect = require('../effects/Effect.js');
var GlowShader = require('../shaders/GlowShader.js');

var defaults = {
    amount: 0.1,
    intensity: 1
};

var GLOW_MAX = 5;

var GlowEffect = function(options) {
    Effect.call(this, 'GlowEffect', defaults);

    this.update(options);
};

GlowEffect.info = {
    name: 'Glow'
};

Class.extend(GlowEffect, Effect, {
    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(GlowShader);
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        var options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({ size: options.amount * GLOW_MAX, amount: options.intensity });
            this.hasUpdate = false;
        }
    }
});

module.exports = GlowEffect;
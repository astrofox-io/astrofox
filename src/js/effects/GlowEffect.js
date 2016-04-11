'use strict';

var _ = require('lodash');
var Effect = require('../effects/Effect.js');
var ShaderPass = require('../graphics/ShaderPass.js');
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

GlowEffect.prototype = _.create(Effect.prototype, {
    constructor: GlowEffect,

    addToScene: function(scene) {
        this.setPass(new ShaderPass(GlowShader));
    },

    removeFromScene: function(scene) {
        this.pass = null;
    },

    updateScene: function(scene) {
        var options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({
                amount: options.amount * GLOW_MAX,
                intensity: options.intensity
            });

            this.hasUpdate = false;
        }
    }
});

module.exports = GlowEffect;
'use strict';

var _ = require('lodash');
var Effect = require('../effects/Effect.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var PixelateShader = require('../shaders/PixelateShader.js');

var defaults = {
    size: 10
};

var MAX_PIXEL_SIZE = 200;

var PixelateEffect = function(options) {
    Effect.call(this, 'PixelateEffect', defaults);

    this.update(options);
};

PixelateEffect.info = {
    name: 'Pixelate'
};

PixelateEffect.prototype = _.create(Effect.prototype, {
    constructor: PixelateEffect,

    addToScene: function(scene) {
        this.pass = new ShaderPass(PixelateShader);
    },

    removeFromScene: function(scene) {
        this.pass = null;
    },

    updateScene: function(scene) {
        if (this.hasUpdate) {
            var amount = (854 / this.options.size);

            this.pass.setUniforms({ amount: amount });

            this.hasUpdate = false;
        }
    }
});

module.exports = PixelateEffect;
'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var PixelateShader = require('shaders/PixelateShader.js');

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

Class.extend(PixelateEffect, Effect, {
    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(PixelateShader);
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
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
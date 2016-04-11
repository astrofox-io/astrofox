'use strict';

var _ = require('lodash');
var Effect = require('../effects/Effect.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var PixelateShader = require('../shaders/PixelateShader.js');
var HexagonShader = require('../shaders/HexagonShader.js');

var defaults = {
    type: 'Square',
    size: 10
};

var MAX_PIXEL_SIZE = 200;

var shaders = {
    Square: PixelateShader,
    Hexagon: HexagonShader
};

var PixelateEffect = function(options) {
    Effect.call(this, 'PixelateEffect', defaults);

    this.update(options);
};

PixelateEffect.info = {
    name: 'Pixelate'
};

PixelateEffect.prototype = _.create(Effect.prototype, {
    constructor: PixelateEffect,

    update: function(options) {
        var changed = Effect.prototype.update.call(this, options);

        if (this.pass && options.type !== undefined) {
            this.setPass(this.getShaderPass(this.options.type));
        }

        return changed;
    },

    addToScene: function(scene) {
        this.setPass(this.getShaderPass(this.options.type));
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
    },

    getShaderPass: function(type) {
        var pass = new ShaderPass(shaders[type]);
        pass.setUniforms(this.options);

        return pass;
    }
});

module.exports = PixelateEffect;
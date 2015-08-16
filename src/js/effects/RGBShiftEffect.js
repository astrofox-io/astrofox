'use strict';

var THREE = require('three');
var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var RGBShiftShader = require('shaders/RGBShiftShader.js');

var defaults = {
    amount: 0.005,
    angle: 0.0
};

var id = 0;
var RADIANS = 0.017453292519943295;

var RGBShiftEffect = function(options) {
    Effect.call(this, id++, 'RGBShiftEffect', defaults);

    this.shader = RGBShiftShader;

    this.update(options);
};

RGBShiftEffect.info = {
    name: 'RGB Shift'
};

Class.extend(RGBShiftEffect, Effect, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

        this.changed = changed;

        return changed;
    },

    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(this.shader);
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        var options = this.options;

        if (this.changed) {
            this.pass.setUniforms({
                amount: options.amount,
                angle: options.angle * RADIANS
            });

            this.changed = false;
        }
    }
});

module.exports = RGBShiftEffect;
'use strict';

var _ = require('lodash');
var Effect = require('../effects/Effect.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var RGBShiftShader = require('../shaders/RGBShiftShader.js');

var defaults = {
    amount: 0.005,
    angle: 0.0
};

var RADIANS = 0.017453292519943295;

var RGBShiftEffect = function(options) {
    Effect.call(this, 'RGBShiftEffect', defaults);

    this.update(options);
};

RGBShiftEffect.info = {
    name: 'RGB Shift'
};

RGBShiftEffect.prototype = _.create(Effect.prototype, {
    constructor: RGBShiftEffect,

    addToScene: function(scene) {
        this.setPass(new ShaderPass(RGBShiftShader));
    },

    removeFromScene: function(scene) {
        this.pass = null;
    },

    updateScene: function(scene) {
        var options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({
                amount: options.amount,
                angle: options.angle * RADIANS
            });

            this.hasUpdate = false;
        }
    }
});

module.exports = RGBShiftEffect;
'use strict';

var THREE = require('three');
var Class = require('core/Class.js');
var ShaderDisplay = require('display/ShaderDisplay.js');
var RGBShiftShader = require('shaders/RGBShiftShader.js');

var defaults = {
    amount: 0.005,
    angle: 0.0
};

var id = 0;
var RADIANS = 0.017453292519943295;

var RGBShiftDisplay = function(options) {
    ShaderDisplay.call(this, id++, 'RGBShiftDisplay', defaults);

    this.shader = RGBShiftShader;

    this.update(options);
};

RGBShiftDisplay.info = {
    name: 'RGB Shift'
};

Class.extend(RGBShiftDisplay, ShaderDisplay, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

        if (options && options.angle !== undefined) {
            this.options.angle = options.angle * RADIANS;
            changed = true;
        }

        this.changed = changed;

        return changed;
    },

    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(this.shader);
        //this.pass.material.blending = THREE.SubtractiveBlending;
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        if (this.changed) {
            this.pass.setUniforms(this.options);
            this.changed = false;
        }
    }
});

module.exports = RGBShiftDisplay;
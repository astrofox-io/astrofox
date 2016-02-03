'use strict';

var _ = require('lodash');
var Effect = require('../effects/Effect.js');
var MirrorShader = require('../shaders/MirrorShader.js');

var defaults = {
    side: 1
};

var MirrorEffect = function(options) {
    Effect.call(this, 'MirrorEffect', defaults);

    this.update(options);
};

MirrorEffect.info = {
    name: 'Mirror'
};

MirrorEffect.prototype = _.create(Effect.prototype, {
    constructor: MirrorEffect,

    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(MirrorShader);
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        if (this.hasUpdate) {
            this.pass.setUniforms(this.options);
            this.hasUpdate = false;
        }
    }
});

module.exports = MirrorEffect;
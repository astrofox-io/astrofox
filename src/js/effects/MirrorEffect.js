'use strict';

var _ = require('lodash');
var Effect = require('../effects/Effect.js');
var ShaderPass = require('../graphics/ShaderPass.js');
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
        this.setPass(new ShaderPass(MirrorShader));
    },

    removeFromScene: function(scene) {
        this.pass = null;
    },

    updateScene: function(scene) {
        if (this.hasUpdate) {
            this.pass.setUniforms(this.options);
            this.hasUpdate = false;
        }
    }
});

module.exports = MirrorEffect;
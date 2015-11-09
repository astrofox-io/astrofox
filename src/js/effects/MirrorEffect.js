'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var MirrorShader = require('shaders/MirrorShader.js');

var defaults = {
    side: 1
};

var MirrorEffect = function(options) {
    Effect.call(this, 'MirrorEffect', defaults);

    this.shader = MirrorShader;

    this.update(options);
};

MirrorEffect.info = {
    name: 'Mirror'
};

Class.extend(MirrorEffect, Effect, {
    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(this.shader);
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
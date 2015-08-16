'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var BlurShader = require('shaders/BlurShader.js');

var defaults = {
    amount: 1.0
};

var id = 0;

var BlurEffect = function(options) {
    Effect.call(this, id++, 'BlurEffect', defaults);

    this.shader = BlurShader;

    this.update(options);
};

BlurEffect.info = {
    name: 'Blur'
};

Class.extend(BlurEffect, Effect, {
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
        if (this.changed) {
            this.pass.setUniforms({ amount: [this.options.amount, this.options.amount] });
            this.changed = false;
        }
    }
});

module.exports = BlurEffect;
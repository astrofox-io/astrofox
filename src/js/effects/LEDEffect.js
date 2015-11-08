'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var LEDShader = require('shaders/LEDShader.js');

var defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};

var LEDEffect = function(options) {
    Effect.call(this, 'LEDEffect', defaults);

    this.update(options);
};

LEDEffect.info = {
    name: 'LED'
};

Class.extend(LEDEffect, Effect, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

        this.changed = changed;

        return changed;
    },

    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(LEDShader);
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

module.exports = LEDEffect;
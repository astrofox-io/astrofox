'use strict';

var Class = require('core/Class.js');
var ShaderDisplay = require('display/ShaderDisplay.js');
var LEDShader = require('shaders/LEDShader.js');

var defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};

var id = 0;

var LEDDisplay = function(options) {
    ShaderDisplay.call(this, id++, 'LEDDisplay', defaults);

    this.shader = LEDShader;

    this.update(options);
};

LEDDisplay.info = {
    name: 'LED'
};

Class.extend(LEDDisplay, ShaderDisplay, {
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
            this.pass.setUniforms(this.options);
            this.changed = false;
        }
    }
});

module.exports = LEDDisplay;
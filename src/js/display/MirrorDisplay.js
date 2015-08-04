'use strict';

var Class = require('core/Class.js');
var ShaderDisplay = require('display/ShaderDisplay.js');
var MirrorShader = require('shaders/MirrorShader.js');

var defaults = {
    side: 1
};

var id = 0;

var MirrorDisplay = function(options) {
    ShaderDisplay.call(this, id++, 'MirrorDisplay', defaults);

    this.shader = MirrorShader;

    this.update(options);
};

MirrorDisplay.info = {
    name: 'Mirror'
};

Class.extend(MirrorDisplay, ShaderDisplay, {
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

module.exports = MirrorDisplay;
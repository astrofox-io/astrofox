'use strict';

var Class = require('core/Class.js');
var ShaderDisplay = require('display/ShaderDisplay.js');
var BlurShader = require('shaders/BlurShader.js');

var defaults = {
    h: 1,
    v: 1
};

var id = 0;

var BlurDisplay = function(options) {
    ShaderDisplay.call(this, id++, 'BlurDisplay', defaults);

    this.shader = BlurShader;

    this.update(options);
};

BlurDisplay.info = {
    name: 'Blur'
};

Class.extend(BlurDisplay, ShaderDisplay, {
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
            //console.log(this.pass.uniforms);
            this.pass.uniforms.delta.value.set(this.options.h, this.options.v);
            this.changed = false;
        }
    }
});

module.exports = BlurDisplay;
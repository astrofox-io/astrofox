'use strict';

var Class = require('core/Class.js');
var ShaderDisplay = require('display/ShaderDisplay.js');
var DotMatrixShader = require('shaders/DotMatrixShader.js');

var defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};

var id = 0;
var RADIANS = 0.017453292519943295;

var DotMatrixDisplay = function(options) {
    ShaderDisplay.call(this, id++, 'DotMatrixDisplay', defaults);

    this.shader = DotMatrixShader;

    this.update(options);
};

DotMatrixDisplay.info = {
    name: 'Dot Matrix'
};

Class.extend(DotMatrixDisplay, ShaderDisplay, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

        //console.log(options);

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

module.exports = DotMatrixDisplay;
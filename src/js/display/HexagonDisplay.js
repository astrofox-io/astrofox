'use strict';

var Class = require('core/Class.js');
var ShaderDisplay = require('display/ShaderDisplay.js');
var HexagonShader = require('shaders/HexagonShader.js');

var defaults = {
    scale: 10.0,
    center: 0.5
};

var id = 0;

var HexagonDisplay = function(options) {
    ShaderDisplay.call(this, id++, 'HexagonDisplay', defaults);

    this.shader = HexagonShader;

    this.update(options);
};

HexagonDisplay.info = {
    name: 'Hexagon'
};

Class.extend(HexagonDisplay, ShaderDisplay, {
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
        var options = this.options;

        if (this.changed) {
            this.pass.setUniforms({ scale: options.scale, center: [options.center, options.center] });
            this.changed = false;
        }
    }
});

module.exports = HexagonDisplay;
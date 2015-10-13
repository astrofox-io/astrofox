'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var HexagonShader = require('shaders/HexagonShader.js');

var defaults = {
    scale: 10.0
};

var id = 0;

var HexagonEffect = function(options) {
    Effect.call(this, id++, 'HexagonEffect', defaults);

    this.shader = HexagonShader;

    this.update(options);
};

HexagonEffect.info = {
    name: 'Hexagon'
};

Class.extend(HexagonEffect, Effect, {
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
            this.pass.setUniforms({ scale: options.scale });
            this.changed = false;
        }
    }
});

module.exports = HexagonEffect;
'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var HexagonShader = require('shaders/HexagonShader.js');

var defaults = {
    scale: 10.0
};

var HexagonEffect = function(options) {
    Effect.call(this, 'HexagonEffect', defaults);

    this.update(options);
};

HexagonEffect.info = {
    name: 'Hexagon'
};

Class.extend(HexagonEffect, Effect, {
    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(HexagonShader);
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        var options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({ scale: options.scale });
            this.hasUpdate = false;
        }
    }
});

module.exports = HexagonEffect;
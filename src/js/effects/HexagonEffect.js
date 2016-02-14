'use strict';

var _ = require('lodash');
var Effect = require('../effects/Effect.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var HexagonShader = require('../shaders/HexagonShader.js');

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

HexagonEffect.prototype = _.create(Effect.prototype, {
    constructor: HexagonEffect,

    addToScene: function(scene) {
        this.pass = new ShaderPass(HexagonShader);
    },

    removeFromScene: function(scene) {
        this.pass = null;
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
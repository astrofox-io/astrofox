'use strict';

var _ = require('lodash');
var ComposerPass = require('../graphics/ComposerPass.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var CopyShader = require('../shaders/CopyShader.js');

var defaults = {
    needsSwap: true,
    forceClear: true,
    clearDepth: true
};

var MultiPass = function(composer, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    this.composer = composer;
    this.copyPass = new ShaderPass(CopyShader, { transparent: true });
};

MultiPass.prototype = _.create(ComposerPass.prototype, {
    constructor: MultiPass,

    getPasses: function() {
        return this.composer.getPasses();
    },

    process: function(renderer, writeBuffer, readBuffer) {
        var composer = this.composer;

        composer.readTarget = readBuffer;
        composer.writeTarget = writeBuffer;

        composer.render();

        this.copyPass.process(renderer, composer.writeBuffer, composer.readBuffer);
    }
});

module.exports = MultiPass;
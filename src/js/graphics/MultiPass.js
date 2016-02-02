'use strict';

var _ = require('lodash');
var Class = require('../core/Class.js');
var ComposerPass = require('../graphics/ComposerPass.js');

var defaults = {
    needsSwap: true,
    forceClear: true,
    clearDepth: true
};

var MultiPass = function(composer, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    this.composer = composer;
};

Class.extend(MultiPass, ComposerPass, {
    getPasses: function() {
        return this.composer.getPasses();
    },

    process: function(renderer, writeBuffer, readBuffer) {
        var composer = this.composer;

        composer.readTarget = readBuffer;
        composer.writeTarget = writeBuffer;

        composer.render();
    }
});

module.exports = MultiPass;
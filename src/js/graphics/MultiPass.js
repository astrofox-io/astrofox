'use strict';

var _ = require('lodash');
var Class = require('core/Class.js');
var ComposerPass = require('graphics/ComposerPass.js');

var MultiPass = function(composer) {
    ComposerPass.call(this, {});

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
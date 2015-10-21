'use strict';

var _ = require('lodash');
var Class = require('core/Class.js');
var ComposerPass = require('graphics/ComposerPass.js');

var ClearMaskPass = function () {
    this.enabled = true;
};

Class.extend(ClearMaskPass, ComposerPass, {
    process: function (renderer) {
        var context = renderer.context;

        context.disable(context.STENCIL_TEST);
    }
});

module.exports = ClearMaskPass;
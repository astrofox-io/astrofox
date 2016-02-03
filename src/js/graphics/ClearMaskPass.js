'use strict';

var _ = require('lodash');
var ComposerPass = require('../graphics/ComposerPass.js');

var ClearMaskPass = function () {
    this.enabled = true;
};

ClearMaskPass.prototype = _.create(ComposerPass.prototype, {
    constructor: ClearMaskPass,

    process: function (renderer) {
        var context = renderer.context;

        context.disable(context.STENCIL_TEST);
    }
});

module.exports = ClearMaskPass;
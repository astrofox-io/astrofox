'use strict';

var _ = require('lodash');

var defaults = {
    enabled: true,
    forceClear: false,
    needsSwap: false,
    clearDepth: false,
    renderToScreen: false
};

var ComposerPass = function(options) {
    this.options = _.assign({}, defaults, options);
};

ComposerPass.prototype = {
    update: function(options) {
        for (var prop in options) {
            if (this.options.hasOwnProperty(prop)) {
                if (this.options[prop] !== options[prop]) {
                    this.options[prop] = options[prop];
                }
            }
        }
    },

    process: function(renderer, scene, camera, renderTarget) {
        var options = this.options;

        if (options.clearDepth) {
            renderer.clearDepth();
        }

        if (options.renderToScreen) {
            renderer.render(scene, camera);
        }
        else {
            renderer.render(scene, camera, renderTarget, options.forceClear);
        }
    }
};

module.exports = ComposerPass;
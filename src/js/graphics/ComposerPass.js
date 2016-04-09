'use strict';

var _ = require('lodash');

var defaults = {
    enabled: true,
    forceClear: false,
    needsSwap: false,
    clearColor: false,
    clearDepth: false,
    clearStencil: false,
    renderToScreen: false,
    setClearColor: null,
    setClearAlpha: 1.0
};

var ComposerPass = function(options) {
    this.options = _.assign({}, defaults, options);
};

ComposerPass.prototype = {
    constructor: ComposerPass,

    update: function(options) {
        for (var prop in options) {
            if (options.hasOwnProperty(prop) && this.options.hasOwnProperty(prop)) {
                if (this.options[prop] !== options[prop]) {
                    this.options[prop] = options[prop];
                }
            }
        }
    },

    setBlending: function(blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha) {
        if (this.material) {
            var material = this.material;

            material.blending = blending;
            material.blendEquation = blendEquation;
            material.blendSrc = blendSrc;
            material.blendDst = blendDst;

            material.blendEquationAlpha = blendEquationAlpha || null;
            material.blendSrcAlpha = blendSrcAlpha || null;
            material.blendDstAlpha = blendDstAlpha || null;
        }
    },

    render: function(renderer, scene, camera, renderTarget) {
        var options = this.options,
            clearColor, clearAlpha;

        // Set new values
        if (options.setClearColor) {
            clearColor = renderer.getClearColor();
            clearAlpha = renderer.getClearAlpha();

            renderer.setClearColor(options.setClearColor, options.setClearAlpha);
        }

        // Clear buffers
        if (options.clearColor || options.clearDepth || options.clearStencil) {
            renderer.clear(options.clearColor, options.clearDepth, options.clearStencil);
        }

        // Render
        if (options.renderToScreen) {
            renderer.render(scene, camera);
        }
        else {
            renderer.render(scene, camera, renderTarget, options.forceClear);
        }

        // Reset values
        if (options.setClearColor) {
            renderer.setClearColor(clearColor, clearAlpha);
        }
    }
};

module.exports = ComposerPass;
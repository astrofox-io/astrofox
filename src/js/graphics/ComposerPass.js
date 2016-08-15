'use strict';

const defaults = {
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

class ComposerPass {
    constructor(options) {
        this.options = Object.assign({}, defaults, options);
    }

    update(options) {
        if (typeof options === 'object') {
            Object.keys(options).forEach(prop => {
                if (this.options.hasOwnProperty(prop) && this.options[prop] !== options[prop]) {
                    this.options[prop] = options[prop];
                }
            });
        }
    }

    setBlending(blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha) {
        if (this.material) {
            let material = this.material;

            material.blending = blending;
            material.blendEquation = blendEquation;
            material.blendSrc = blendSrc;
            material.blendDst = blendDst;

            material.blendEquationAlpha = blendEquationAlpha || null;
            material.blendSrcAlpha = blendSrcAlpha || null;
            material.blendDstAlpha = blendDstAlpha || null;
        }
    }

    render(renderer, scene, camera, renderTarget) {
        let options = this.options,
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
}

module.exports = ComposerPass;
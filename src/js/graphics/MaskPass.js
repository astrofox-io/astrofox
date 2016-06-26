'use strict';

const ComposerPass = require('../graphics/ComposerPass.js');

const defaults = {
    inverse: false
};

class MaskPass extends ComposerPass {
    constructor(scene, camera, options) {
        super(Object.assign({}, defaults, options));

        this.scene = scene;
        this.camera = camera;
    }

    process(renderer, writeBuffer, readBuffer) {
        let context = renderer.context,
            options = this.options,
            writeValue = (options.inverse) ? 0 : 1,
            clearValue = (options.inverse) ? 1 : 0;

        // Don't update color or depth
        context.colorMask(false, false, false, false);
        context.depthMask(false);

        // Set up stencil
        context.enable(context.STENCIL_TEST);
        context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
        context.stencilFunc(context.ALWAYS, writeValue, 0xffffffff);
        context.clearStencil(clearValue);

        // Draw into the stencil buffer
        renderer.render(this.scene, this.camera, readBuffer, this.clear);
        renderer.render(this.scene, this.camera, writeBuffer, this.clear);

        // Re-enable update of color and depth
        context.colorMask(true, true, true, true);
        context.depthMask(true);

        // Only render where stencil is set to 1
        context.stencilFunc(context.EQUAL, 1, 0xffffffff);  // draw if == 1
        context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
    }
}

module.exports = MaskPass;

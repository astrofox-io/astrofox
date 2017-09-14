import ComposerPass from 'graphics/ComposerPass';

const defaults = {
    inverse: false,
    clear: true
};

export default class MaskPass extends ComposerPass {
    constructor(scene, camera, options) {
        super(Object.assign({}, defaults, options));

        this.scene = scene;
        this.camera = camera;
    }

    render(renderer, writeBuffer, readBuffer) {
        let { context, state } = renderer,
            { clear, inverse } = this.options,
            writeValue = (inverse) ? 0 : 1,
            clearValue = (inverse) ? 1 : 0;

        // Don't update color or depth
        state.buffers.color.setMask(false);
        state.buffers.depth.setMask(false);

        // Lock buffers
        state.buffers.color.setLocked(true);
        state.buffers.depth.setLocked(true);

        // Set up stencil
        state.buffers.stencil.setTest(true);
        state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
        state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
        state.buffers.stencil.setClear(clearValue);

        // Draw into the stencil buffer
        renderer.render(this.scene, this.camera, readBuffer, clear);
        renderer.render(this.scene, this.camera, writeBuffer, clear);

        // Unlock color and depth buffer for subsequent rendering
        state.buffers.color.setLocked(false);
        state.buffers.depth.setLocked(false);

        // Only render where stencil is set to 1
        state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
        state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
    }
}
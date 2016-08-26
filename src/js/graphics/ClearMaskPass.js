'use strict';

var ComposerPass = require('../graphics/ComposerPass');

class ClearMaskPass extends ComposerPass {
    constructor(options) {
        super(options);
        
        this.enabled = true;
    }
    
    render(renderer) {
        let context = renderer.context;

        context.disable(context.STENCIL_TEST);
    }
}

module.exports = ClearMaskPass;
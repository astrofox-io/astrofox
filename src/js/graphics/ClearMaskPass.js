'use strict';

var ComposerPass = require('../graphics/ComposerPass.js');

class ClearMaskPass extends ComposerPass {
    constructor(options) {
        super(options);
        
        this.enabled = true;
    }
    
    process(renderer) {
        let context = renderer.context;

        context.disable(context.STENCIL_TEST);
    }
}

module.exports = ClearMaskPass;
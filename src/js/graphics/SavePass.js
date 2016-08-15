'use strict';

const ShaderPass = require('../graphics/ShaderPass.js');
const CopyShader = require('../shaders/CopyShader.js');

const defaults = {
    transparent: true,
    needsSwap: false,
    forceClear: true
};

class SavePass extends ShaderPass {
    constructor(buffer, options) {
        super(CopyShader, Object.assign({}, defaults, options));

        this.buffer = buffer;
    }

    render(renderer, writeBuffer, readBuffer) {
        super.render(renderer, this.buffer, readBuffer);
    }
}

module.exports = SavePass;
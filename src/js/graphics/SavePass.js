import ShaderPass from '../graphics/ShaderPass';
import CopyShader from '../shaders/CopyShader';

const defaults = {
    transparent: true,
    needsSwap: false,
    forceClear: true
};

export default class SavePass extends ShaderPass {
    constructor(buffer, options) {
        super(CopyShader, Object.assign({}, defaults, options));

        this.buffer = buffer;
    }

    render(renderer, writeBuffer, readBuffer) {
        super.render(renderer, this.buffer, readBuffer);
    }
}
import ShaderPass from 'graphics/ShaderPass';
import CopyShader from 'shaders/CopyShader';

export default class SavePass extends ShaderPass {
    static defaults = {
        transparent: true,
        needsSwap: false,
        forceClear: true,
    }

    constructor(buffer, options) {
        super(CopyShader, Object.assign({}, SavePass.defaults, options));

        this.buffer = buffer;
    }

    render(renderer, writeBuffer, readBuffer) {
        super.render(renderer, this.buffer, readBuffer);
    }
}

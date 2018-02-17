import {
    NormalBlending,
} from 'three';
import ShaderPass from 'graphics/ShaderPass';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'config/blendModes.json';

export default class BlendPass extends ShaderPass {
    static defaults = {
        transparent: true,
        needsSwap: true,
        opacity: 1.0,
        blendMode: 'Normal',
        alpha: 1,
        blending: NormalBlending,
        baseBuffer: true,
    }

    constructor(buffer, options) {
        super(BlendShader, Object.assign({}, BlendPass.defaults, options));

        this.buffer = buffer;
    }

    render(renderer, writeBuffer, readBuffer) {
        const { options } = this;

        this.setUniforms({
            tBase: (options.baseBuffer) ? this.buffer : readBuffer.texture,
            tBlend: (options.baseBuffer) ? readBuffer.texture : this.buffer,
            opacity: options.opacity,
            mode: blendModes[options.blendMode],
            alpha: options.alpha,
        });

        this.mesh.material = this.material;

        super.render(renderer, writeBuffer, readBuffer);
    }
}

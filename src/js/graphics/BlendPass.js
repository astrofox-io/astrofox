import * as THREE from 'three';
import ShaderPass from '../graphics/ShaderPass';
import BlendShader from '../shaders/BlendShader';
import BlendModes from '../graphics/BlendModes';

const defaults = {
    transparent: true,
    needsSwap: true,
    opacity: 1.0,
    blendMode: 'Normal',
    alpha: 1,
    blending: THREE.NormalBlending,
    baseBuffer: true
};

export default class BlendPass extends ShaderPass {
    constructor(buffer, options) {
        super(BlendShader, Object.assign({}, defaults, options));

        this.buffer = buffer;
    }

    render(renderer, writeBuffer, readBuffer) {
        let options = this.options;

        this.setUniforms({
            tBase: (options.baseBuffer) ? this.buffer : readBuffer,
            tBlend: (options.baseBuffer) ? readBuffer : this.buffer,
            opacity: options.opacity,
            mode: BlendModes[options.blendMode],
            alpha: options.alpha
        });

        this.mesh.material = this.material;

        super.render(renderer, writeBuffer, readBuffer);
    }
}
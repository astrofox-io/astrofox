'use strict';

const THREE = require('three');
const ShaderPass = require('../graphics/ShaderPass.js');
const BlendShader = require('../shaders/BlendShader.js');
const BlendModes = require('../graphics/BlendModes.js');

const defaults = {
    transparent: true,
    needsSwap: true,
    opacity: 1.0,
    blendMode: 'Normal',
    alpha: 1,
    blending: THREE.NormalBlending,
    baseBuffer: true
};

class BlendPass extends ShaderPass {
    constructor(buffer, options) {
        super(BlendShader, Object.assign({}, defaults, options));

        this.buffer = buffer;
    }

    process(renderer, writeBuffer, readBuffer) {
        let options = this.options;

        this.setUniforms({
            tBase: (options.baseBuffer) ? this.buffer : readBuffer,
            tBlend: (options.baseBuffer) ? readBuffer : this.buffer,
            opacity: options.opacity,
            mode: BlendModes[options.blendMode],
            alpha: options.alpha
        });

        this.mesh.material = this.material;

        this.render(renderer, this.scene, this.camera, writeBuffer);
    }
}

module.exports = BlendPass;
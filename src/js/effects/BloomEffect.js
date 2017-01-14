'use strict';

const THREE = require('three');
const Effect = require('../effects/Effect');
const ShaderPass = require('../graphics/ShaderPass');
const SavePass = require('../graphics/SavePass');
const BlendPass = require('../graphics/BlendPass');
const GaussianBlurPass = require('../graphics/GaussianBlurPass');
const LuminanceShader = require('../shaders/LuminanceShader');

class BloomEffect extends Effect {
    constructor(options) {
        super(BloomEffect, options);
    }

    updatePass() {
        this.lumPass.setUniforms({ amount: 1 - this.options.threshold });

        this.blurPass.setAmount(this.options.amount);

        this.blendPass.update({ blendMode: this.options.blendMode });
    }

    addToScene(scene) {
        let passes = [],
            composer = scene.composer,
            options = this.options;

        // Save current frame
        this.savePass = new SavePass(
            composer.getRenderTarget(),
            { blending: THREE.NoBlending }
        );
        passes.push(this.savePass);

        // Apply luminance threshold
        this.lumPass = new ShaderPass(LuminanceShader);
        passes.push(this.lumPass);

        // Apply blur
        this.blurPass = new GaussianBlurPass();
        passes.push(this.blurPass);

        // Blend with original frame
        this.blendPass = new BlendPass(
            this.savePass.buffer,
            { blendMode: options.blendMode, alpha: 1 }
        );
        passes.push(this.blendPass);

        // Set render pass
        this.setPass(composer.addMultiPass(passes));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

BloomEffect.label = 'Bloom';

BloomEffect.className = 'BloomEffect';

BloomEffect.defaults = {
    blendMode: 'Screen',
    amount: 0.1,
    threshold: 1.0
};

module.exports = BloomEffect;
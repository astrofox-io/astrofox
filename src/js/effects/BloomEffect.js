'use strict';

const THREE = require('three');
const Composer = require('../graphics/Composer');
const Effect = require('../effects/Effect');
const ShaderPass = require('../graphics/ShaderPass');
const SavePass = require('../graphics/SavePass');
const BlendPass = require('../graphics/BlendPass');
const GaussianBlurPass = require('../graphics/GaussianBlurPass');
const LuminanceShader = require('../shaders/LuminanceShader');
const CopyShader = require('../shaders/CopyShader');

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
        let pass,
            passes = [],
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
        /*
        this.blurPasses = [];
        for (let i = 0; i < GAUSSIAN_ITERATIONS; i++) {
            pass = new ShaderPass(GaussianBlurShader);
            passes.push(pass);
            this.blurPasses.push(pass);

            this.updateGaussianPass(pass, i);
        }*/

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

    removeFromScene(scene) {
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
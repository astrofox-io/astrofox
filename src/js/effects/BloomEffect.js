'use strict';

const THREE = require('three');
const Composer = require('../graphics/Composer.js');
const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const SavePass = require('../graphics/SavePass.js');
const BlendPass = require('../graphics/BlendPass.js');
const GaussianBlurShader = require('../shaders/GaussianBlurShader.js');
const LuminanceShader = require('../shaders/LuminanceShader.js');
const CopyShader = require('../shaders/CopyShader.js');

const defaults = {
    blendMode: 'Screen',
    amount: 0.1,
    threshold: 1.0
};

const GAUSSIAN_BLUR_MAX = 3;
const GAUSSIAN_ITERATIONS = 8;

class BloomEffect extends Effect {
    constructor(options) {
        super('BloomEffect', defaults);

        this.update(options);
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
        this.blurPasses = [];
        for (let i = 0; i < GAUSSIAN_ITERATIONS; i++) {
            pass = new ShaderPass(GaussianBlurShader);
            passes.push(pass);
            this.blurPasses.push(pass);

            this.updateGaussianPass(pass, i);
        }

        // Blend with original frame
        this.blendPass = new BlendPass(
            this.savePass.buffer,
            { blendMode: options.blendMode, alpha: 1 }
        );
        passes.push(this.blendPass);

        // Set render pass
        this.setPass(composer.addMultiPass(passes));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    renderToScene(scene) {
        if (this.hasUpdate) {
            let options = this.options;

            this.lumPass.setUniforms({ amount: 1 - options.threshold });

            this.blurPasses.forEach((pass, i) => {
                this.updateGaussianPass(pass, i);
            }, this);

            this.blendPass.update({ blendMode: options.blendMode });

            this.hasUpdate = false;
        }
    }

    updateGaussianPass(pass, i) {
        let options = this.options,
            amount = options.amount * GAUSSIAN_BLUR_MAX,
            radius = (GAUSSIAN_ITERATIONS - i - 1) * amount;

        pass.setUniforms({ direction: (i % 2 === 0) ? [0, radius] : [radius, 0] });
    }
}

BloomEffect.info = {
    name: 'Bloom'
};

module.exports = BloomEffect;
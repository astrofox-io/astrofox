'use strict';

const Effect = require('../effects/Effect.js');
const BoxBlurShader = require('../shaders/BoxBlurShader.js');
const CircularBlurShader = require('../shaders/CircularBlurShader.js');
const GaussianBlurShader = require('../shaders/GaussianBlurShader.js');
const ZoomBlurShader = require('../shaders/ZoomBlurShader.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const MultiPass = require('../graphics/MultiPass.js');

const shaders = {
    Box: BoxBlurShader,
    Circular: CircularBlurShader,
    Gaussian: GaussianBlurShader,
    Zoom: ZoomBlurShader
};

const BOX_BLUR_MAX = 20;
const CIRCULAR_BLUR_MAX = 10;
const ZOOM_BLUR_MAX = 1;
const GAUSSIAN_BLUR_MAX = 3;
const GAUSSIAN_ITERATIONS = 8;

class BlurEffect extends Effect { 
    constructor(options) {
        super(BlurEffect, options);
    }

    update(options) {
        let type = this.options.type,
            changed = super.update(options);

        if (changed) {
            if (this.owner && options.type !== undefined && options.type != type) {
                this.setPass(this.getShaderPass(options.type));
            }
        }

        return changed;
    }

    updatePass() {
        switch (this.options.type) {
            case 'Box':
                this.pass.setUniforms({ amount: this.options.amount * BOX_BLUR_MAX });
                break;

            case 'Circular':
                this.pass.setUniforms({ amount: this.options.amount * CIRCULAR_BLUR_MAX });
                break;

            case 'Gaussian':
                this.pass.getPasses().forEach((pass, i) => {
                    if (i < GAUSSIAN_ITERATIONS) {
                        this.updateGaussianPass(pass, i);
                    }
                });
                break;

            case 'Zoom':
                this.pass.setUniforms({ amount: this.options.amount * ZOOM_BLUR_MAX });
                break;
        }
    }

    addToScene(scene) {
        this.setPass(this.getShaderPass(this.options.type));
        this.updatePass();
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    updateGaussianPass(pass, i) {
        let options = this.options,
            amount = GAUSSIAN_BLUR_MAX * options.amount,
            radius = (GAUSSIAN_ITERATIONS - i - 1) * amount;

        pass.setUniforms({ direction: (i % 2 === 0) ? [0, radius] : [radius, 0] });
    }

    getShaderPass(type) {
        let pass,
            passes = [],
            shader = shaders[type];

        switch (type) {
            case 'Gaussian':
                for (let i = 0; i < GAUSSIAN_ITERATIONS; i++) {
                    pass = new ShaderPass(shader);
                    passes.push(pass);
                    this.updateGaussianPass(pass, i);
                }

                return new MultiPass(passes);
                break;

            case 'Box':
                return new ShaderPass(BoxBlurShader);
                break;

            default:
                return new ShaderPass(shader);
        }
    }
}

BlurEffect.label = 'Blur';

BlurEffect.className = 'BlurEffect';

BlurEffect.defaults = {
    type: 'Gaussian',
    amount: 0.1
};

module.exports = BlurEffect;
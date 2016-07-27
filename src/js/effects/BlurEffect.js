'use strict';

const Effect = require('../effects/Effect.js');
const BoxBlurShader = require('../shaders/BoxBlurShader.js');
const CircularBlurShader = require('../shaders/CircularBlurShader.js');
const GaussianBlurShader = require('../shaders/GaussianBlurShader.js');
const ZoomBlurShader = require('../shaders/ZoomBlurShader.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const MultiPass = require('../graphics/MultiPass.js');

const defaults = {
    type: 'Gaussian',
    amount: 1.0
};

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
        super('BlurEffect', defaults);
        
        this.update(options);
    }

    update(options) {
        if (!options) return;

        let type = this.options.type;

        let changed = Effect.prototype.update.call(this, options);

        if (this.owner && options.type !== undefined && options.type != type) {
            this.setPass(this.getShaderPass(options.type));
        }

        return changed;
    }

    addToScene(scene) {
        this.setPass(this.getShaderPass(this.options.type));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    renderToScene(scene) {
        let amount,
            options = this.options;

        if (this.hasUpdate) {
            switch (this.options.type) {
                case 'Box':
                    amount = BOX_BLUR_MAX * options.amount;
                    this.pass.setUniforms({ amount: amount });
                    break;

                case 'Circular':
                    amount = CIRCULAR_BLUR_MAX * options.amount;
                    this.pass.setUniforms({ amount: amount });
                    break;

                case 'Gaussian':
                    this.pass.getPasses().forEach((pass, i) => {
                        if (i < GAUSSIAN_ITERATIONS) {
                            this.updateGaussianPass(pass, i);
                        }
                    }, this);
                    break;

                case 'Zoom':
                    amount = ZOOM_BLUR_MAX * options.amount;
                    this.pass.setUniforms({ amount: amount });
                    break;
            }

            this.hasUpdate = false;
        }
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

BlurEffect.info = {
    name: 'Blur'
};

module.exports = BlurEffect;
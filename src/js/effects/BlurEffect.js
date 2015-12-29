'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var BoxBlurShader = require('shaders/BoxBlurShader.js');
var GaussianBlurShader = require('shaders/GaussianBlurShader.js');
var ZoomBlurShader = require('shaders/ZoomBlurShader.js');
var ShaderPass = require('graphics/ShaderPass.js');

var defaults = {
    type: 'Box',
    amount: 1.0
};

var shaders = {
    Box: BoxBlurShader,
    Gaussian: GaussianBlurShader,
    Zoom: ZoomBlurShader
};

const BOX_BLUR_MAX = 20;
const ZOOM_BLUR_MAX = 1;
const GAUSSIAN_MAX = 20;
const GAUSSIAN_ITERATIONS = 8;

var BlurEffect = function(options) {
    Effect.call(this, 'BlurEffect', defaults);

    this.update(options);
};

BlurEffect.info = {
    name: 'Blur'
};

Class.extend(BlurEffect, Effect, {
    update: function(options) {
        if (!options) return;

        var type = this.options.type;

        var changed = Effect.prototype.update.call(this, options);

        if (this.scene && options.type != type) {
            this.createShader(options.type);
        }

        return changed;
    },

    addToScene: function(scene) {
        this.scene = scene;
        this.createShader(this.options.type);
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        var amount, passes,
            options = this.options;

        if (this.hasUpdate) {
            switch (this.options.type) {
                case 'Box':
                    amount = BOX_BLUR_MAX * options.amount;
                    passes = this.pass.getPasses();
                    passes.get(0).setUniforms({ amount: [0, amount] });
                    passes.get(1).setUniforms({ amount: [amount, 0] });
                    break;

                case 'Gaussian':
                    this.pass.getPasses().forEach(function(pass, i) {
                        this.updateGaussianPass(pass, i);
                    }, this);
                    break;

                case 'Zoom':
                    amount = ZOOM_BLUR_MAX * options.amount;
                    this.pass.setUniforms({ amount: amount });
                    break;
            }

            this.hasUpdate = false;
        }
    },

    updateGaussianPass: function(pass, i) {
        var options = this.options,
            amount = options.amount * GAUSSIAN_MAX,
            radius = (GAUSSIAN_ITERATIONS - i - 1) * amount / GAUSSIAN_ITERATIONS;

        pass.setUniforms({ direction: (i % 2 == 0) ? [0, radius] : [radius, 0] });
    },

    createShader: function(type) {
        var pass,
            passes = [],
            shader = shaders[type],
            composer = this.scene.composer;

        if (this.pass) {
            composer.removePass(this.pass);
        }

        switch (type) {
            case 'Gaussian':
                for (var i = 0; i < GAUSSIAN_ITERATIONS; i++) {
                    pass = new ShaderPass(shader);
                    passes.push(pass);

                    this.updateGaussianPass(pass, i);
                }

                this.pass = composer.addMultiPass(passes);
                break;

            case 'Box':
                passes.push(new ShaderPass(shader));
                passes.push(new ShaderPass(shader));

                this.pass = composer.addMultiPass(passes);
                break;

            default:
                this.pass = composer.addShaderPass(shader);
        }
    }
});

module.exports = BlurEffect;
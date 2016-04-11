'use strict';

var _ = require('lodash');
var THREE = require('three');
var Effect = require('../effects/Effect.js');
var BoxBlurShader = require('../shaders/BoxBlurShader.js');
var CircularBlurShader = require('../shaders/CircularBlurShader.js');
var GaussianBlurShader = require('../shaders/GaussianBlurShader.js');
var ZoomBlurShader = require('../shaders/ZoomBlurShader.js');
var CopyShader = require('../shaders/CopyShader.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var MultiPass = require('../graphics/MultiPass.js');

var RGBShiftShader = require('../shaders/RGBShiftShader.js');
var DotScreenShader = require('../shaders/DotScreenShader.js');
var MirrorShader = require('../shaders/MirrorShader.js');

var defaults = {
    type: 'Gaussian',
    amount: 1.0
};

var shaders = {
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

var BlurEffect = function(options) {
    Effect.call(this, 'BlurEffect', defaults);

    this.update(options);
};

BlurEffect.info = {
    name: 'Blur'
};

BlurEffect.prototype = _.create(Effect.prototype, {
    constructor: BlurEffect,

    update: function(options) {
        if (!options) return;

        var type = this.options.type;

        var changed = Effect.prototype.update.call(this, options);

        if (this.owner && options.type !== undefined && options.type != type) {
            this.setPass(this.getShaderPass(options.type));
        }

        return changed;
    },

    addToScene: function(scene) {
        this.setPass(this.getShaderPass(this.options.type));
    },

    removeFromScene: function(scene) {
        this.pass = null;
    },

    updateScene: function(scene) {
        var amount,
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
                    this.pass.getPasses().forEach(function(pass, i) {
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
    },

    updateGaussianPass: function(pass, i) {
        var options = this.options,
            amount = GAUSSIAN_BLUR_MAX * options.amount,
            radius = (GAUSSIAN_ITERATIONS - i - 1) * amount;

        pass.setUniforms({ direction: (i % 2 === 0) ? [0, radius] : [radius, 0] });
    },

    getShaderPass: function(type) {
        var pass,
            passes = [],
            shader = shaders[type];

        switch (type) {
            case 'Gaussian':
                for (var i = 0; i < GAUSSIAN_ITERATIONS; i++) {
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
});

module.exports = BlurEffect;
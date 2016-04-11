'use strict';

var _ = require('lodash');
var THREE = require('three');
var Composer = require('../graphics/Composer.js');
var Effect = require('../effects/Effect.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var SavePass = require('../graphics/SavePass.js');
var BlendPass = require('../graphics/BlendPass.js');
var GaussianBlurShader = require('../shaders/GaussianBlurShader.js');
var LuminanceShader = require('../shaders/LuminanceShader.js');
var CopyShader = require('../shaders/CopyShader.js');

var defaults = {
    blendMode: 'Screen',
    amount: 0.1,
    threshold: 1.0
};

const GAUSSIAN_BLUR_MAX = 3;
const GAUSSIAN_ITERATIONS = 8;

var BloomEffect = function(options) {
    Effect.call(this, 'BloomEffect', defaults);

    this.update(options);
};

BloomEffect.info = {
    name: 'Bloom'
};

BloomEffect.prototype = _.create(Effect.prototype, {
    constructor: BloomEffect,

    addToScene: function(scene) {
        var pass,
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
        for (var i = 0; i < GAUSSIAN_ITERATIONS; i++) {
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
    },

    removeFromScene: function(scene) {
        this.pass = null;
    },

    updateScene: function(scene) {
        if (this.hasUpdate) {
            var options = this.options;

            this.lumPass.setUniforms({ amount: 1 - options.threshold });

            this.blurPasses.forEach(function(pass, i) {
                this.updateGaussianPass(pass, i);
            }, this);

            this.blendPass.update({ blendMode: options.blendMode });

            this.hasUpdate = false;
        }
    },

    updateGaussianPass: function(pass, i) {
        var options = this.options,
            amount = options.amount * GAUSSIAN_BLUR_MAX,
            radius = (GAUSSIAN_ITERATIONS - i - 1) * amount;

        pass.setUniforms({ direction: (i % 2 === 0) ? [0, radius] : [radius, 0] });
    }
});

module.exports = BloomEffect;
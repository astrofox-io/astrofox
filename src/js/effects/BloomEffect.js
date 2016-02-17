'use strict';

var _ = require('lodash');
var Composer = require('../graphics/Composer.js');
var Effect = require('../effects/Effect.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var SavePass = require('../graphics/SavePass.js');
var BlendPass = require('../graphics/BlendPass.js');
var BlendModes = require('../graphics/BlendModes.js');
var GaussianBlurShader = require('../shaders/GaussianBlurShader.js');
var LuminanceShader = require('../shaders/LuminanceShader.js');
var CopyShader = require('../shaders/CopyShader.js');

var defaults = {
    blendMode: 'Screen',
    amount: 0.1,
    luminance: 1.0
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

        this.savePass = new SavePass(composer.getRenderTarget());
        passes.push(this.savePass);

        this.lumPass = new ShaderPass(LuminanceShader);
        passes.push(this.lumPass);

        for (var i = 0; i < GAUSSIAN_ITERATIONS; i++) {
            pass = new ShaderPass(GaussianBlurShader);
            passes.push(pass);

            this.updateGaussianPass(pass, i);
        }

        this.blendPass = new BlendPass(this.savePass.buffer);
        this.blendPass.setUniforms({ mode: BlendModes[options.blendMode] });
        passes.push(this.blendPass);

        this.pass = composer.addMultiPass(passes);
        this.scene = scene;
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        if (this.hasUpdate) {
            var options = this.options;

            this.lumPass.setUniforms({ amount: 1 - options.luminance });

            this.pass.getPasses().forEach(function(pass, i) {
                if (i > 0 && i < GAUSSIAN_ITERATIONS - 1) {
                    this.updateGaussianPass(pass, i);
                }
            }, this);

            this.blendPass.setUniforms({ mode: BlendModes[options.blendMode] });

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
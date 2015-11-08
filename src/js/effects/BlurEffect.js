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

var GAUSSIAN_ITERATIONS = 8;

var BlurEffect = function(options) {
    Effect.call(this, 'BlurEffect', defaults);

    this.update(options);
};

BlurEffect.info = {
    name: 'Blur'
};

Class.extend(BlurEffect, Effect, {
    update: function(options) {
        var type = this.options.type;

        var changed = this._super.update.call(this, options);

        if (this.scene && options && options.type != type) {
            this.createShader();
        }

        this.changed = changed;

        return changed;
    },

    addToScene: function(scene) {
        this.scene = scene;
        this.createShader();
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        var options = this.options;

        if (this.changed) {
            switch (this.options.type) {
                case 'Box':
                    this.pass.setUniforms({ amount: [options.amount, options.amount] });
                    break;

                case 'Gaussian':
                    this.pass.getPasses().forEach(function(pass, i) {
                        this.updateGaussianPass(pass, i);
                    }.bind(this));
                    break;

                case 'Zoom':
                    this.pass.setUniforms({ amount: options.amount / 10 });
                    break;
            }

            this.changed = false;
        }
    },

    updateGaussianPass: function(pass, i) {
        var options = this.options,
            radius = (GAUSSIAN_ITERATIONS - i - 1) * options.amount / GAUSSIAN_ITERATIONS;

        pass.setUniforms({ direction: (i % 2 == 0) ? [0, radius] : [radius, 0] });
    },

    createShader: function() {
        var options = this.options,
            composer = this.scene.composer;

        if (this.pass) {
            composer.removePass(this.pass);
        }

        switch (options.type) {
            case 'Gaussian':
                var passes = [],
                    pass;

                for (var i = 0; i < GAUSSIAN_ITERATIONS; i++) {
                    pass = new ShaderPass(GaussianBlurShader);
                    passes.push(pass);

                    this.updateGaussianPass(pass, i);
                }

                this.pass = composer.addMultiPass(passes);

                break;

            default:
                this.pass = composer.addShaderPass(shaders[options.type]);
        }
    }
});

module.exports = BlurEffect;
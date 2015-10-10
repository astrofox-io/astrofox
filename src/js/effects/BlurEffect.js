'use strict';

var Class = require('core/Class.js');
var Effect = require('effects/Effect.js');
var BoxBlurShader = require('shaders/BoxBlurShader.js');
var GaussianBlurShader = require('shaders/GaussianBlurShader.js');
var BarrelBlurShader = require('shaders/BarrelBlurShader.js');

var defaults = {
    type: 'Box',
    amount: 1.0
};

var id = 0;

var BlurEffect = function(options) {
    Effect.call(this, id++, 'BlurEffect', defaults);

    this.update(options);
};

BlurEffect.info = {
    name: 'Blur'
};

Class.extend(BlurEffect, Effect, {
    update: function(options) {
        var type = this.options.type;

        var changed = this._super.update.call(this, options);

        if (options && options.type != type) {
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
        if (this.changed) {
            switch (this.options.type) {
                case 'Box':
                    this.pass.setUniforms({ amount: [this.options.amount, this.options.amount] });
                    break;

                case 'Gaussian':
                    break;
            }

            this.changed = false;
        }
    },

    createShader: function() {
        var options = this.options,
            composer = this.scene.composer;

        composer.removePass(this.pass);

        switch (options.type) {
            case 'Box':
                this.pass = composer.addShaderPass(BoxBlurShader);
                break;

            case 'Gaussian':
                this.pass = composer.addShaderPass(GaussianBlurShader);
                break;

            case 'Barrel':
                this.pass = composer.addShaderPass(BarrelBlurShader);
                break;
        }
    }
});

module.exports = BlurEffect;
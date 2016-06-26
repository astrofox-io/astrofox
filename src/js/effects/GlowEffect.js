'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const GlowShader = require('../shaders/GlowShader.js');

const defaults = {
    amount: 0.1,
    intensity: 1
};

const GLOW_MAX = 5;

class GlowEffect extends Effect {
    constructor(options) {
        super('GlowEffect', defaults);

        this.update(options);
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(GlowShader));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    updateScene(scene) {
        let options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({
                amount: options.amount * GLOW_MAX,
                intensity: options.intensity
            });

            this.hasUpdate = false;
        }
    }
}

GlowEffect.info = {
    name: 'Glow'
};

module.exports = GlowEffect;
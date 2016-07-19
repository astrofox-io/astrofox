'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const RGBShiftShader = require('../shaders/RGBShiftShader.js');
const { deg2rad } = require('../util/math.js');

const defaults = {
    amount: 0.005,
    angle: 0.0
};

class RGBShiftEffect extends Effect {
    constructor(options) {
        super('RGBShiftEffect', defaults);
    
        this.update(options);
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(RGBShiftShader));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    updateScene(scene) {
        let options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({
                amount: options.amount,
                angle: deg2rad(options.angle)
            });

            this.hasUpdate = false;
        }
    }
}

RGBShiftEffect.info = {
    name: 'RGB Shift'
};

module.exports = RGBShiftEffect;
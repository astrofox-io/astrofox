'use strict';

const Effect = require('../effects/Effect');
const ShaderPass = require('../graphics/ShaderPass');
const RGBShiftShader = require('../shaders/RGBShiftShader');
const { deg2rad } = require('../util/math');

const OFFSET_MAX = 854;

class RGBShiftEffect extends Effect {
    constructor(options) {
        super(RGBShiftEffect, options);
    }

    updatePass() {
        this.pass.setUniforms({
            amount: this.options.offset / OFFSET_MAX,
            angle: deg2rad(this.options.angle)
        });
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(RGBShiftShader));
        this.updatePass();
    }

    removeFromScene(scene) {
        this.pass = null;
    }
}

RGBShiftEffect.label = 'RGB Shift';

RGBShiftEffect.className = 'RGBShiftEffect';

RGBShiftEffect.defaults = {
    offset: 5,
    angle: 45
};

module.exports = RGBShiftEffect;
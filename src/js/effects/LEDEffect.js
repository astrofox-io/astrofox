'use strict';

const Effect = require('../effects/Effect');
const ShaderPass = require('../graphics/ShaderPass');
const LEDShader = require('../shaders/LEDShader');

class LEDEffect extends Effect {
    constructor(options) {
        super(LEDEffect, options);
    }

    addToScene() {
        this.setPass(new ShaderPass(LEDShader));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

LEDEffect.label = 'LED';

LEDEffect.className = 'LEDEffect';

LEDEffect.defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};

module.exports = LEDEffect;
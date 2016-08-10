'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const LEDShader = require('../shaders/LEDShader.js');

class LEDEffect extends Effect {
    constructor(options) {
        super(LEDEffect.label, Object.assign({}, LEDEffect.defaults, options));

        this.initialized = !!options;
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(LEDShader));
        this.updatePass();
    }

    removeFromScene(scene) {
        this.pass = null;
    }
}

LEDEffect.label = 'LED';

LEDEffect.defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};

module.exports = LEDEffect;
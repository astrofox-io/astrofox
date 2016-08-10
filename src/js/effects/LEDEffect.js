'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const LEDShader = require('../shaders/LEDShader.js');

class LEDEffect extends Effect {
    constructor(options) {
        super('LEDEffect', LEDEffect.defaults);

        this.update(options);
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(LEDShader));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    renderToScene(scene) {
        if (this.hasUpdate) {
            this.pass.setUniforms(this.options);
            this.hasUpdate = false;
        }
    }
}

LEDEffect.label = 'LED';

LEDEffect.defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};

module.exports = LEDEffect;
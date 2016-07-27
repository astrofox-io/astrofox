'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const LEDShader = require('../shaders/LEDShader.js');

const defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};

class LEDEffect extends Effect {
    constructor(options) {
        super('LEDEffect', defaults);

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

LEDEffect.info = {
    name: 'LED'
};

module.exports = LEDEffect;
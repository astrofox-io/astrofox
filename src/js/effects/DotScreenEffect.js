'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const DotScreenShader = require('../shaders/DotScreenShader.js');

const defaults = {
    angle: 90,
    scale: 1.0
};

const RADIANS = 0.017453292519943295;

class DotScreenEffect extends Effect {
    constructor(options) {
        super('DotScreenEffect', defaults);

        this.update(options);
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(DotScreenShader));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    updateScene(scene) {
        let options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({
                scale: options.scale,
                angle: options.angle * RADIANS
            });

            this.hasUpdate = false;
        }
    }
}

DotScreenEffect.info = {
    name: 'Dot Screen'
};

module.exports = DotScreenEffect;
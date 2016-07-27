'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const DotScreenShader = require('../shaders/DotScreenShader.js');
const { deg2rad } = require('../util/math.js');

const defaults = {
    angle: 90,
    scale: 1.0
};

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

    renderToScene(scene) {
        let options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({
                scale: options.scale,
                angle: deg2rad(options.angle)
            });

            this.hasUpdate = false;
        }
    }
}

DotScreenEffect.info = {
    name: 'Dot Screen'
};

module.exports = DotScreenEffect;
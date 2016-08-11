'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const DotScreenShader = require('../shaders/DotScreenShader.js');
const { deg2rad } = require('../util/math.js');

class DotScreenEffect extends Effect {
    constructor(options) {
        super(DotScreenEffect.className, Object.assign({}, DotScreenEffect.defaults, options));

        this.initialized = !!options;
    }

    updatePass() {
        this.pass.setUniforms({
            scale: this.options.scale,
            angle: deg2rad(this.options.angle)
        });
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(DotScreenShader));
        this.updatePass();
    }

    removeFromScene(scene) {
        this.pass = null;
    }
}

DotScreenEffect.label = 'Dot Screen';

DotScreenEffect.className = 'DotScreenEffect';

DotScreenEffect.defaults = {
    angle: 90,
    scale: 1.0
};

module.exports = DotScreenEffect;
'use strict';

const Effect = require('../effects/Effect');
const ShaderPass = require('../graphics/ShaderPass');
const DotScreenShader = require('../shaders/DotScreenShader');
const { deg2rad } = require('../util/math');

class DotScreenEffect extends Effect {
    constructor(options) {
        super(DotScreenEffect, options);
    }

    updatePass() {
        this.pass.setUniforms({
            scale: this.options.scale,
            angle: deg2rad(this.options.angle)
        });
    }

    addToScene() {
        this.setPass(new ShaderPass(DotScreenShader));
        this.updatePass();
    }

    removeFromScene() {
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
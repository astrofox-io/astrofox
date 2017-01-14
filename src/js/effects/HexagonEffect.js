'use strict';

const Effect = require('../effects/Effect');
const ShaderPass = require('../graphics/ShaderPass');
const HexagonShader = require('../shaders/HexagonShader');

class HexagonEffect extends Effect {
    constructor(options) {
        super(HexagonEffect, options);
    }

    updatePass() {
        this.pass.setUniforms({ scale: this.options.scale });
    }

    addToScene() {
        this.setPass(new ShaderPass(HexagonShader));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

HexagonEffect.label = 'Hexagon';

HexagonEffect.className = 'HexagonEffect';

HexagonEffect.defaults = {
    scale: 10.0
};

module.exports = HexagonEffect;
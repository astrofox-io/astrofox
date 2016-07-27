'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const HexagonShader = require('../shaders/HexagonShader.js');

const defaults = {
    scale: 10.0
};

class HexagonEffect extends Effect {
    constructor(options) {
        super('HexagonEffect', defaults);

        this.update(options);
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(HexagonShader));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    renderToScene(scene) {
        let options = this.options;

        if (this.hasUpdate) {
            this.pass.setUniforms({ scale: options.scale });
            this.hasUpdate = false;
        }
    }
}

HexagonEffect.info = {
    name: 'Hexagon'
};

module.exports = HexagonEffect;
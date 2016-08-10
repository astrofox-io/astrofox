'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const HexagonShader = require('../shaders/HexagonShader.js');

class HexagonEffect extends Effect {
    constructor(options) {
        super('HexagonEffect', HexagonEffect.defaults);

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

HexagonEffect.label = 'Hexagon';

HexagonEffect.defaults = {
    scale: 10.0
};

module.exports = HexagonEffect;
'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const PixelateShader = require('../shaders/PixelateShader.js');
const HexagonShader = require('../shaders/HexagonShader.js');

const defaults = {
    type: 'Square',
    size: 10
};

const shaders = {
    Square: PixelateShader,
    Hexagon: HexagonShader
};

class PixelateEffect extends Effect {
    constructor(options) {
        super('PixelateEffect', defaults);

        this.update(options);
    }

    update(options) {
        let changed = Effect.prototype.update.call(this, options);

        if (this.pass && options.type !== undefined) {
            this.setPass(this.getShaderPass(this.options.type));
        }

        return changed;
    }

    addToScene(scene) {
        this.setPass(this.getShaderPass(this.options.type));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    renderToScene(scene) {
        if (this.hasUpdate) {
            this.pass.setUniforms({ size: this.options.size });

            this.hasUpdate = false;
        }
    }

    getShaderPass(type) {
        let pass = new ShaderPass(shaders[type]);
        pass.setUniforms(this.options);

        return pass;
    }
}

PixelateEffect.info = {
    name: 'Pixelate'
};

module.exports = PixelateEffect;
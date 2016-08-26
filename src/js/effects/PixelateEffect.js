'use strict';

const Effect = require('../effects/Effect');
const ShaderPass = require('../graphics/ShaderPass');
const PixelateShader = require('../shaders/PixelateShader');
const HexagonShader = require('../shaders/HexagonShader');

const shaders = {
    Square: PixelateShader,
    Hexagon: HexagonShader
};

class PixelateEffect extends Effect {
    constructor(options) {
        super(PixelateEffect, options);
    }

    update(options) {
        let changed = Effect.prototype.update.call(this, options);

        if (this.pass && options.type !== undefined) {
            this.setPass(this.getShaderPass(this.options.type));
        }

        return changed;
    }

    updatePass() {
        this.pass.setUniforms({ size: this.options.size });
    }

    addToScene(scene) {
        this.setPass(this.getShaderPass(this.options.type));
        this.updatePass();
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    getShaderPass(type) {
        let pass = new ShaderPass(shaders[type]);
        pass.setUniforms(this.options);

        return pass;
    }
}

PixelateEffect.label = 'Pixelate';

PixelateEffect.className = 'PixelateEffect';

PixelateEffect.defaults = {
    type: 'Square',
    size: 10
};

module.exports = PixelateEffect;
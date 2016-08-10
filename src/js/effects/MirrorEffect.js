'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const MirrorShader = require('../shaders/MirrorShader.js');

class MirrorEffect extends Effect {
    constructor(options) {
        super('MirrorEffect', Object.assign({}, MirrorEffect.defaults, options));

        this.initialized = !!options;
    }
    
    addToScene(scene) {
        this.setPass(new ShaderPass(MirrorShader));
        this.updatePass();
    }

    removeFromScene(scene) {
        this.pass = null;
    }
}

MirrorEffect.label = 'Mirror';

MirrorEffect.defaults = {
    side: 1
};

module.exports = MirrorEffect;
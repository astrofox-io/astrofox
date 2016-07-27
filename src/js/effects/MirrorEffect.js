'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const MirrorShader = require('../shaders/MirrorShader.js');

const defaults = {
    side: 1
};

class MirrorEffect extends Effect {
    constructor(options) {
        super('MirrorEffect', defaults);
    
        this.update(options);
    }
    
    addToScene(scene) {
        this.setPass(new ShaderPass(MirrorShader));
    }

    removeFromScene(scene) {
        this.pass = null;
    }

    renderToScene(scene) {
        if (this.hasUpdate) {
            this.pass.setUniforms(this.options);
            this.hasUpdate = false;
        }
    }
}

MirrorEffect.info = {
    name: 'Mirror'
};

module.exports = MirrorEffect;
'use strict';

const Effect = require('../effects/Effect');
const ShaderPass = require('../graphics/ShaderPass');
const MirrorShader = require('../shaders/MirrorShader');

class MirrorEffect extends Effect {
    constructor(options) {
        super(MirrorEffect, options);
    }
    
    addToScene() {
        this.setPass(new ShaderPass(MirrorShader));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

MirrorEffect.label = 'Mirror';

MirrorEffect.className = 'MirrorEffect';

MirrorEffect.defaults = {
    side: 1
};

module.exports = MirrorEffect;
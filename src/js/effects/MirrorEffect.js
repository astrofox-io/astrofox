import Effect from '../effects/Effect';
import ShaderPass from '../graphics/ShaderPass';
import MirrorShader from '../shaders/MirrorShader';

export default class MirrorEffect extends Effect {
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
import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import MirrorShader from 'shaders/MirrorShader';

export default class MirrorEffect extends Effect {
    static label = 'Mirror';

    static className = 'MirrorEffect';

    static defaults = {
        side: 0,
    }

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

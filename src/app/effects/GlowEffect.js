import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import GlowShader from 'shaders/GlowShader';

const GLOW_MAX = 5;

export default class GlowEffect extends Effect {
    static label = 'Glow';

    static className = 'GlowEffect';

    static defaultOptions = {
        amount: 0.1,
        intensity: 1,
    }

    constructor(options) {
        super(GlowEffect, options);
    }

    updatePass() {
        this.pass.setUniforms({
            amount: this.options.amount * GLOW_MAX,
            intensity: this.options.intensity,
        });
    }

    addToScene() {
        this.setPass(new ShaderPass(GlowShader));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

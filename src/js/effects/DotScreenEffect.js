import Effect from 'effects/Effect';
import ShaderPass from 'graphics/ShaderPass';
import DotScreenShader from 'shaders/DotScreenShader';
import { deg2rad } from 'util/math';

export default class DotScreenEffect extends Effect {
    constructor(options) {
        super(DotScreenEffect, options);
    }

    updatePass() {
        this.pass.setUniforms({
            scale: this.options.scale,
            angle: deg2rad(this.options.angle)
        });
    }

    addToScene() {
        this.setPass(new ShaderPass(DotScreenShader));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

DotScreenEffect.label = 'Dot Screen';

DotScreenEffect.className = 'DotScreenEffect';

DotScreenEffect.defaults = {
    angle: 90,
    scale: 1.0
};
import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import RGBShiftShader from 'shaders/RGBShiftShader';
import { deg2rad } from 'util/math';

export default class RGBShiftEffect extends Effect {
    constructor(options) {
        super(RGBShiftEffect, options);
    }

    updatePass() {
        let { width } = this.owner.getSize();

        this.pass.setUniforms({
            amount: this.options.offset / width,
            angle: deg2rad(this.options.angle)
        });
    }

    addToScene() {
        this.setPass(new ShaderPass(RGBShiftShader));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

RGBShiftEffect.label = 'RGB Shift';

RGBShiftEffect.className = 'RGBShiftEffect';

RGBShiftEffect.defaults = {
    offset: 5,
    angle: 45
};
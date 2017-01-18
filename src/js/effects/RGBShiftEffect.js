import Effect from '../effects/Effect';
import ShaderPass from '../graphics/ShaderPass';
import RGBShiftShader from '../shaders/RGBShiftShader';
import { deg2rad } from '../util/math';

const OFFSET_MAX = 854;

export default class RGBShiftEffect extends Effect {
    constructor(options) {
        super(RGBShiftEffect, options);
    }

    updatePass() {
        this.pass.setUniforms({
            amount: this.options.offset / OFFSET_MAX,
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
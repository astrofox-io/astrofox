import Effect from '../effects/Effect';
import ShaderPass from '../graphics/ShaderPass';
import LEDShader from '../shaders/LEDShader';

export default class LEDEffect extends Effect {
    constructor(options) {
        super(LEDEffect, options);
    }

    addToScene() {
        this.setPass(new ShaderPass(LEDShader));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

LEDEffect.label = 'LED';

LEDEffect.className = 'LEDEffect';

LEDEffect.defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};
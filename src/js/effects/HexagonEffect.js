import Effect from '../effects/Effect';
import ShaderPass from '../graphics/ShaderPass';
import HexagonShader from '../shaders/HexagonShader';

export default class HexagonEffect extends Effect {
    constructor(options) {
        super(HexagonEffect, options);
    }

    updatePass() {
        this.pass.setUniforms({ scale: this.options.scale });
    }

    addToScene() {
        this.setPass(new ShaderPass(HexagonShader));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }
}

HexagonEffect.label = 'Hexagon';

HexagonEffect.className = 'HexagonEffect';

HexagonEffect.defaults = {
    scale: 10.0
};
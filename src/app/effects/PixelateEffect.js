import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import PixelateShader from 'shaders/PixelateShader';
import HexagonShader from 'shaders/HexagonShader';

const shaders = {
    Square: PixelateShader,
    Hexagon: HexagonShader,
};

export default class PixelateEffect extends Effect {
    static label = 'Pixelate';

    static className = 'PixelateEffect';

    static defaults = {
        type: 'Square',
        size: 10,
    }

    constructor(options) {
        super(PixelateEffect, options);
    }

    update(options) {
        const changed = Effect.prototype.update.call(this, options);

        if (this.pass && options.type !== undefined) {
            this.setPass(this.getShaderPass(this.options.type));
        }

        return changed;
    }

    updatePass() {
        this.pass.setUniforms({ size: this.options.size });
    }

    addToScene() {
        this.setPass(this.getShaderPass(this.options.type));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }

    getShaderPass(type) {
        const pass = new ShaderPass(shaders[type]);
        const { width, height } = this.scene.getSize();

        pass.setUniforms(this.options);
        pass.setSize(width, height);

        return pass;
    }
}

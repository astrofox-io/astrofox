import Effect from '../effects/Effect';
import BoxBlurShader from '../shaders/BoxBlurShader';
import CircularBlurShader from '../shaders/CircularBlurShader';
import ZoomBlurShader from '../shaders/ZoomBlurShader';
import ShaderPass from '../graphics/ShaderPass';
import GaussianBlurPass from '../graphics/GaussianBlurPass';

const shaders = {
    Box: BoxBlurShader,
    Circular: CircularBlurShader,
    Zoom: ZoomBlurShader
};

const BOX_BLUR_MAX = 20;
const CIRCULAR_BLUR_MAX = 10;
const ZOOM_BLUR_MAX = 1;

export default class BlurEffect extends Effect {
    constructor(options) {
        super(BlurEffect, options);
    }

    update(options) {
        let type = this.options.type,
            changed = super.update(options);

        if (changed) {
            if (this.owner && options.type !== undefined && options.type !== type) {
                this.setPass(this.getShaderPass(options.type));
            }
        }

        return changed;
    }

    updatePass() {
        let { type, amount } = this.options;

        switch (type) {
            case 'Box':
                this.pass.setUniforms({ amount: amount * BOX_BLUR_MAX });
                break;

            case 'Circular':
                this.pass.setUniforms({ amount: amount * CIRCULAR_BLUR_MAX });
                break;

            case 'Gaussian':
                this.pass.setAmount(amount);
                break;

            case 'Zoom':
                this.pass.setUniforms({ amount: amount * ZOOM_BLUR_MAX });
                break;
        }
    }

    addToScene() {
        this.setPass(this.getShaderPass(this.options.type));
        this.updatePass();
    }

    removeFromScene() {
        this.pass = null;
    }

    getShaderPass(type) {
        let pass,
            { width, height } = this.owner.getSize();

        switch (type) {
            case 'Gaussian':
                pass = new GaussianBlurPass();
                break;

            default:
                pass = new ShaderPass(shaders[type]);
        }

        pass.setSize(width, height);

        return pass;
    }
}

BlurEffect.label = 'Blur';

BlurEffect.className = 'BlurEffect';

BlurEffect.defaults = {
    type: 'Gaussian',
    amount: 0.1
};
/* eslint-disable react/require-render-return */
import Component from '../core/Component';

const defaults = {
    enabled: true,
    forceClear: false,
    needsSwap: false,
    clearColor: false,
    clearDepth: false,
    clearStencil: false,
    renderToScreen: false,
    setClearColor: null,
    setClearAlpha: 1.0
};

export default class ComposerPass extends Component {
    constructor(options) {
        super(Object.assign({}, defaults, options));
    }

    setSize(width, height) {
        if (this.uniforms) {
            Object.keys(this.uniforms).forEach(key => {
                if (key === 'resolution') {
                    this.uniforms[key].value.set(width, height);
                }
            });
        }
    }

    setBlending(blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha) {
        if (this.material) {
            let material = this.material;

            material.blending = blending;
            material.blendEquation = blendEquation;
            material.blendSrc = blendSrc;
            material.blendDst = blendDst;

            material.blendEquationAlpha = blendEquationAlpha || null;
            material.blendSrcAlpha = blendSrcAlpha || null;
            material.blendDstAlpha = blendDstAlpha || null;
        }
    }

    render(renderer, scene, camera, renderTarget) {
        let options = this.options,
            clearColor, clearAlpha;

        // Set new values
        if (options.setClearColor) {
            clearColor = renderer.getClearColor();
            clearAlpha = renderer.getClearAlpha();

            renderer.setClearColor(options.setClearColor, options.setClearAlpha);
        }

        // Clear buffers
        if (options.clearColor || options.clearDepth || options.clearStencil) {
            renderer.clear(options.clearColor, options.clearDepth, options.clearStencil);
        }

        // Render
        if (options.renderToScreen) {
            renderer.render(scene, camera);
        }
        else {
            renderer.render(scene, camera, renderTarget, options.forceClear);
        }

        // Reset values
        if (options.setClearColor) {
            renderer.setClearColor(clearColor, clearAlpha);
        }
    }
}
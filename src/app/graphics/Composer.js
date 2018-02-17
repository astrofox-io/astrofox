import {
    WebGLRenderTarget,
    LinearFilter,
    RGBAFormat,
    Texture,
} from 'three';
import EventEmitter from 'core/EventEmitter';
import NodeCollection from 'core/NodeCollection';
import MultiPass from 'graphics/MultiPass';
import RenderPass from 'graphics/RenderPass';
import ShaderPass from 'graphics/ShaderPass';
import SpritePass from 'graphics/SpritePass';
import TexturePass from 'graphics/TexturePass';
import CopyShader from 'shaders/CopyShader';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'config/blendModes.json';

export default class Composer extends EventEmitter {
    constructor(renderer, renderTarget) {
        super();

        this.renderer = renderer;
        this.passes = new NodeCollection();
        this.maskActive = false;

        this.copyPass = new ShaderPass(CopyShader, { transparent: true });
        this.blendPass = new ShaderPass(BlendShader, { transparent: true });

        this.setRenderTarget(renderTarget || this.getRenderTarget());
    }

    getRenderTarget() {
        const { renderer } = this;
        const pixelRatio = renderer.getPixelRatio();
        const width = Math.floor(renderer.context.canvas.width / pixelRatio) || 1;
        const height = Math.floor(renderer.context.canvas.height / pixelRatio) || 1;

        return new WebGLRenderTarget(
            width,
            height,
            {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBAFormat,
                stencilBuffer: false,
            },
        );
    }

    setRenderTarget(renderTarget) {
        this.readTarget = renderTarget;
        this.writeTarget = renderTarget.clone();

        this.readBuffer = this.readTarget;
        this.writeBuffer = this.writeTarget;
    }

    getSize() {
        return {
            width: this.readTarget.width,
            height: this.readTarget.height,
        };
    }

    setSize(width, height) {
        this.renderer.setSize(width, height, true);
        this.readTarget.setSize(width, height);
        this.writeTarget.setSize(width, height);
    }

    clearScreen(color, depth, stencil) {
        this.renderer.clear(color !== false, depth !== false, stencil !== false);
    }

    clearBuffer(color, depth, stencil) {
        const c = color !== false;
        const d = depth !== false;
        const s = stencil !== false;

        this.renderer.clearTarget(this.readTarget, c, d, s);
        this.renderer.clearTarget(this.writeTarget, c, d, s);
    }

    clear(color, alpha) {
        const { renderer } = this;
        const clearColor = renderer.getClearColor();
        const clearAlpha = renderer.getClearAlpha();

        if (color) {
            renderer.setClearColor(color, alpha);
        }

        this.clearScreen();
        this.clearBuffer();

        if (color) {
            renderer.setClearColor(clearColor, clearAlpha);
        }
    }

    dispose() {
        this.clearPasses();
        this.readTarget.dispose();
        this.writeTarget.dispose();
    }

    swapBuffers() {
        const tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;
    }

    getPasses() {
        return this.passes.nodes;
    }

    addPass(pass) {
        this.passes.addNode(pass);

        return pass;
    }

    removePass(pass) {
        this.passes.removeNode(pass);
    }

    addRenderPass(scene, camera, options) {
        return this.addPass(new RenderPass(scene, camera, options));
    }

    addShaderPass(shader, options) {
        return this.addPass(new ShaderPass(shader, options));
    }

    addTexturePass(texture, options) {
        return this.addPass(new TexturePass(texture, options));
    }

    addSpritePass(image, options) {
        const texture = new Texture(image);
        texture.minFilter = LinearFilter;

        return this.addPass(new SpritePass(texture, options));
    }

    addCopyPass(options) {
        return this.addShaderPass(CopyShader, options);
    }

    addMultiPass(passes, options) {
        return this.addPass(new MultiPass(passes, options));
    }

    clearPasses() {
        this.passes.clear();
    }

    blendBuffer(buffer, options) {
        const {
            renderer,
            blendPass,
            readBuffer,
            writeBuffer,
        } = this;

        const {
            opacity,
            blendMode,
            mask,
            inverse,
        } = options;

        blendPass.setUniforms({
            tBase: readBuffer.texture,
            tBlend: buffer.texture,
            opacity,
            mode: blendModes[blendMode],
            alpha: 1,
            mask,
            inverse,
        });

        blendPass.render(renderer, writeBuffer);

        this.swapBuffers();
    }

    renderToScreen() {
        const pass = this.copyPass;

        pass.update({ renderToScreen: true });

        pass.render(this.renderer, this.writeBuffer, this.readBuffer);

        pass.update({ renderToScreen: false });
    }

    render() {
        const { renderer } = this;

        this.writeBuffer = this.writeTarget;
        this.readBuffer = this.readTarget;

        this.getPasses().forEach((pass) => {
            if (pass.options.enabled) {
                pass.render(renderer, this.writeBuffer, this.readBuffer);

                if (pass.options.needsSwap) {
                    this.swapBuffers();
                }
            }
        });
    }
}

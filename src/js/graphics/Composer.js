import * as THREE from 'three';
import EventEmitter from '../core/EventEmitter';
import NodeCollection from '../core/NodeCollection';
import RenderPass from '../graphics/RenderPass';
import ShaderPass from '../graphics/ShaderPass';
import SpritePass from '../graphics/SpritePass';
import TexturePass from '../graphics/TexturePass';
import MultiPass from '../graphics/MultiPass';
import BlendModes from '../graphics/BlendModes';
import CopyShader from '../shaders/CopyShader';
import BlendShader from '../shaders/BlendShader';

export default class Composer extends EventEmitter {
    constructor(renderer, renderTarget) {
        super();
        
        this.renderer = renderer;
        this.passes = new NodeCollection();
        this.maskActive = false;
    
        this.copyPass = new ShaderPass(CopyShader, { transparent: true });
        this.blendPass = new ShaderPass(BlendShader, { transparent: true });
    
        if (!renderTarget) {
            renderTarget = this.getRenderTarget();
        }
    
        this.setRenderTarget(renderTarget);
    }

    getRenderTarget() {
        let renderer = this.renderer,
            pixelRatio = renderer.getPixelRatio(),
            width = Math.floor(renderer.context.canvas.width / pixelRatio) || 1,
            height = Math.floor(renderer.context.canvas.height / pixelRatio) || 1;

        return new THREE.WebGLRenderTarget(
            width,
            height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                stencilBuffer: true
            }
        );
    }

    setRenderTarget(renderTarget) {
        this.readTarget = renderTarget;
        this.writeTarget = renderTarget.clone();

        this.readBuffer = this.readTarget;
        this.writeBuffer = this.writeTarget;
    }

    clearScreen(color, depth, stencil) {
        color = color !== false;
        depth = depth !== false;
        stencil = stencil !== false;

        this.renderer.clear(color, depth, stencil);
    }

    clearBuffer(color, depth, stencil) {
        color = color !== false;
        depth = depth !== false;
        stencil = stencil !== false;

        this.renderer.clearTarget(this.readTarget, color, depth, stencil);
        this.renderer.clearTarget(this.writeTarget, color, depth, stencil);
    }

    clear(color, alpha) {
        let renderer = this.renderer,
            clearColor = renderer.getClearColor(),
            clearAlpha = renderer.getClearAlpha();

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

    setSize(width, height) {
        this.renderer.setSize(width, height);
        this.readTarget.setSize(width, height);
        this.writeTarget.setSize(width, height);
    }

    swapBuffers() {
        let tmp = this.readBuffer;
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
        if (typeof texture !== THREE.Texture) {
            texture = new THREE.Texture(texture);
            texture.minFilter = THREE.LinearFilter;
        }

        return this.addPass(new TexturePass(texture, options));
    }

    addSpritePass(image, options) {
        let texture = new THREE.Texture(image);
        texture.minFilter = THREE.LinearFilter;

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
        let pass = this.blendPass;

        pass.setUniforms({
            tBase: this.readBuffer,
            tBlend: buffer,
            opacity: options.opacity,
            mode: BlendModes[options.blendMode],
            alpha: 1
        });

        pass.render(this.renderer, this.writeBuffer);

        this.swapBuffers();
    }

    renderToScreen() {
        let pass = this.copyPass;

        pass.update({ renderToScreen: true });

        pass.render(this.renderer, this.writeBuffer, this.readBuffer);

        pass.update({ renderToScreen: false });
    }

    render() {
        let renderer = this.renderer;

        this.writeBuffer = this.writeTarget;
        this.readBuffer = this.readTarget;

        this.getPasses().forEach(pass => {
            if (pass.options.enabled) {
                pass.render(renderer, this.writeBuffer, this.readBuffer);

                if (pass.options.needsSwap) {
                    this.swapBuffers();
                }
            }
        });
    }
}
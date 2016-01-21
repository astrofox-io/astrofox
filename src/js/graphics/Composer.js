'use strict';

var _ = require('lodash');
var THREE = require('three');
var Immutable = require('immutable');

var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');
var NodeCollection = require('core/NodeCollection.js');

var RenderPass = require('graphics/RenderPass.js');
var ShaderPass = require('graphics/ShaderPass.js');
var SpritePass = require('graphics/SpritePass.js');
var TexturePass = require('graphics/TexturePass.js');
var MultiPass = require('graphics/MultiPass.js');
var MaskPass = require('graphics/MaskPass.js');
var ClearMaskPass = require('graphics/ClearMaskPass.js');
var CopyShader = require('shaders/CopyShader.js');
var BlendShader = require('shaders/BlendShader.js');
var BlendModes = require('graphics/BlendModes.js');

var Composer = function(renderer, renderTarget) {
    this.renderer = renderer;
    this.passes = new NodeCollection();
    this.maskActive = false;

    this.copyPass = new ShaderPass(CopyShader, { transparent: false });
    this.blendPass = new ShaderPass(BlendShader, { transparent: true });

    // Do not pre-multiply alpha
    this.blendPass.material.blending = THREE.NoBlending;

    this.setRenderTarget(renderTarget);
};

Class.extend(Composer, EventEmitter, {
    getRenderTarget: function() {
        var renderer = this.renderer,
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
                stencilBuffer: false
            }
        );
    },

    setRenderTarget: function(renderTarget) {
        if (!renderTarget) {
            renderTarget = this.getRenderTarget();
        }

        this.readTarget = renderTarget;
        this.writeTarget = renderTarget.clone();

        this.readBuffer = this.readTarget;
        this.writeBuffer = this.writeTarget;
        this.saveBuffer = renderTarget.clone();
    },

    clear: function(color, depth, stencil) {
        this.renderer.clear(color, depth, stencil);
    },

    clearBuffer: function(color, depth, stencil) {
        this.renderer.clearTarget(this.readTarget, color, depth, stencil);
        this.renderer.clearTarget(this.writeTarget, color, depth, stencil);
    },

    clearSaveBuffer: function(color, depth, stencil) {
        this.renderer.clearTarget(this.saveBuffer, color, depth, stencil);
    },

    setSize: function(width, height) {
        var renderTarget = this.writeTarget.clone();

        renderTarget.width = width;
        renderTarget.height = height;

        this.setRenderTarget(renderTarget);
    },

    swapBuffers: function() {
        var tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;
    },

    getPasses: function() {
        return this.passes.nodes;
    },

    addPass: function(pass) {
        this.passes.addNode(pass);

        return pass;
    },

    removePass: function(pass) {
        this.passes.removeNode(pass);
    },

    shiftPass: function(pass, i) {
        var index = this.passes.indexOf(pass);

        this.passes.swapNodes(index, index + i);
    },

    addRenderPass: function(scene, camera, options) {
        return this.addPass(new RenderPass(scene, camera, options));
    },

    addShaderPass: function(shader, options) {
        return this.addPass(new ShaderPass(shader, options));
    },

    addTexturePass: function(texture, options) {
        return this.addPass(new TexturePass(texture, options));
    },

    addCanvasPass: function(canvas, options) {
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;

        return this.addTexturePass(texture, options);
    },

    addSpritePass: function(image, options) {
        var texture = new THREE.Texture(image);
        texture.minFilter = THREE.LinearFilter;

        return this.addPass(new SpritePass(texture, options));
    },

    addCopyPass: function(options) {
        return this.addShaderPass(CopyShader, options);
    },

    addSavePass(options) {
        return this.addCopyPass(_.assign(options, { save: true, needsSwap: false }));
    },

    addMultiPass: function(passes) {
        var composer = new Composer(this.renderer);

        passes.forEach(function(pass) {
            composer.addPass(pass);
        });

        return this.addPass(new MultiPass(composer));
    },

    clearPasses: function() {
        this.passes.clear();
    },

    blendBuffer: function(buffer, options) {
        var pass = this.blendPass;

        pass.material.uniforms['tInput'].value = this.readBuffer;
        pass.material.uniforms['tInput2'].value = buffer;
        pass.material.uniforms['opacity'].value = options.opacity;
        pass.material.uniforms['mode'].value = BlendModes[options.blending];
        pass.material.uniforms['multiplyAlpha'].value = options.multiplyAlpha || 0;

        pass.process(this.renderer, this.writeBuffer);

        // Swap buffers write->read
        this.swapBuffers();
    },

    copyBuffer: function(buffer, options) {
        var pass = this.copyPass;

        pass.material.uniforms['opacity'].value = options.opacity;

        pass.process(this.renderer, this.readBuffer, buffer);
    },

    renderToScreen: function() {
        var pass = this.copyPass;

        pass.update({ renderToScreen: true, clearDepth: true });

        pass.process(this.renderer, this.writeBuffer, this.readBuffer);

        pass.update({ renderToScreen: false, clearDepth: false });
    },

    render: function(delta) {
        var renderer = this.renderer,
            context = this.renderer.context,
            maskActive = this.maskActive;

        this.writeBuffer = this.writeTarget;
        this.readBuffer = this.readTarget;

        this.passes.nodes.forEach(function(pass) {
            if (pass.options.enabled) {
                pass.process(
                    renderer,
                    this.writeBuffer,
                    this.readBuffer,
                    delta,
                    maskActive
                );

                if (pass.options.needsSwap) {
                    if (maskActive) {
                        context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
                        this.copyPass.process(renderer, this.writeBuffer, this.readBuffer, delta);
                        context.stencilFunc(context.EQUAL, 1, 0xffffffff);
                    }

                    this.swapBuffers();
                }

                if (pass instanceof MaskPass) {
                    this.maskActive = true;
                }
                else if (pass instanceof ClearMaskPass) {
                    this.maskActive = false;
                }
                else if (pass instanceof MultiPass) {
                    //this.copyPass.process(renderer, this.writeBuffer, this.readBuffer, delta);
                    //this.swapBuffers();
                }
            }
        }, this);
    }
});

module.exports = Composer;
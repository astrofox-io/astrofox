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
var MaskPass = require('graphics/MaskPass.js');
var ClearMaskPass = require('graphics/ClearMaskPass.js');
var CopyShader = require('shaders/CopyShader.js');

var Composer = function(renderer, renderTarget) {
    this.renderer = renderer;
    this.passes = new NodeCollection();
    this.maskActive = false;

    this.copyPass = new ShaderPass(CopyShader, { transparent: true });

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
    },

    clear: function(color, depth, stencil) {
        this.renderer.clearTarget(this.readTarget, color || true, depth || true, stencil || true);
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

    addSpritePass: function(canvas, options) {
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;

        return this.addPass(new SpritePass(texture, options));
    },

    addCopyPass: function(options) {
        return this.addShaderPass(CopyShader, options);
    },

    clearPasses: function() {
        this.passes.clear();
    },

    renderToScreen: function(options) {
        this.render();

        this.copyPass.update(_.assign({ renderToScreen: true, clearDepth: true }, options));
        this.copyPass.material.blending = options.blending;
        this.copyPass.material.uniforms['opacity'].value = options.opacity;
        this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer);

        this.swapBuffers();
    },

    render: function(delta) {
        var renderer = this.renderer,
            context = this.renderer.context,
            maskActive = this.maskActive;

        this.writeBuffer = this.writeTarget;
        this.readBuffer = this.readTarget;

        this.passes.nodes.forEach(function(pass) {
            if (pass.options.enabled) {
                pass.render(renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

                if (pass.options.needsSwap) {
                    if (maskActive) {
                        context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
                        this.copyPass.render(renderer, this.writeBuffer, this.readBuffer, delta);
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
            }
        }, this);
    }
});

module.exports = Composer;
'use strict';

var _ = require('lodash');
var THREE = require('three');
var Immutable = require('immutable');

var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');

var RenderPass = require('graphics/RenderPass.js');
var ShaderPass = require('graphics/ShaderPass.js');
var TexturePass = require('graphics/TexturePass.js');
var MaskPass = require('graphics/MaskPass.js');
var ClearMaskPass = require('graphics/ClearMaskPass.js');
var CopyShader = require('shaders/CopyShader.js');

var Composer = function(renderer, renderTarget) {
    this.renderer = renderer;
    this.passes = new Immutable.List();
    //this.copyPass = new ShaderPass(CopyShader);
    this.maskActive = false;

    if (typeof renderTarget === 'undefined') {
        renderTarget = this.getRenderTarget(renderer);
    }

    this.initRenderTarget(renderTarget);
};

Class.extend(Composer, EventEmitter, {
    getRenderTarget: function(renderer) {
        var pixelRatio = renderer.getPixelRatio(),
            width = Math.floor( renderer.context.canvas.width / pixelRatio ) || 1,
            height = Math.floor( renderer.context.canvas.height / pixelRatio ) || 1;

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

    initRenderTarget: function(renderTarget) {
        this.writeTarget = renderTarget;
        this.readTarget = renderTarget.clone();

        this.writeBuffer = this.writeTarget;
        this.readBuffer = this.readTarget;
    },

    setSize: function(width, height) {
        var renderTarget = this.writeTarget.clone();

        renderTarget.width = width;
        renderTarget.height = height;

        this.initRenderTarget(renderTarget);
    },

    swapBuffers: function() {
        var tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;
    },

    addPass: function(pass, index) {
        var passes = this.passes;

        this.passes = (typeof index === 'number') ?
            passes.splice(index, 0, pass) :
            passes.push(pass);

        return pass;
    },

    removePass: function(pass) {
        var passes = this.passes,
            index = passes.indexOf(pass);

        if (index > -1) {
            this.passes = passes.delete(index);
        }
    },

    swapPass: function(index, newIndex) {
        var passes = this.passes;

        if (index > -1 && index < passes.size) {
            this.passes = passes.withMutations(function(list) {
                var tmp = list.get(index);
                list.set(index, list.get(newIndex));
                list.set(newIndex, tmp);
            });
        }
    },

    addRenderPass: function(scene, camera, options) {
        return this.addPass(new RenderPass(scene, camera, options));
    },

    addShaderPass: function(shader, options) {
        return this.addPass(new ShaderPass(shader, options));
    },

    addCopyPass: function(options) {
        return this.addShaderPass(CopyShader, options);
    },

    addTexturePass: function(texture, options) {
        return this.addPass(new TexturePass(texture, options));
    },

    addCanvasPass: function(canvas, options) {
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;

        return this.addTexturePass(texture, options);
    },

    renderToScreen: function() {
        return this.addCopyPass({ renderToScreen: true });
    },

    render: function(delta) {
        var renderer = this.renderer,
            context = this.renderer.context,
            maskActive = this.maskActive;

        this.writeBuffer = this.writeTarget;
        this.readBuffer = this.readTarget;

        this.passes.forEach(function(pass){
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
        }.bind(this));
    }
});

module.exports = Composer;
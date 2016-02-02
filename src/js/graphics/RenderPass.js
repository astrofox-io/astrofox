'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('../core/Class.js');
var ComposerPass = require('../graphics/ComposerPass.js');

var defaults = {
    forceClear: true,
    overrideMaterial: null,
    clearColor: null,
    clearAlpha: 1.0
};

var RenderPass = function(scene, camera, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    this.scene = scene;
    this.camera = camera;

    this.clearColor = new THREE.Color();
    this.clearAlpha = 1.0;
};

Class.extend(RenderPass, ComposerPass, {
    process: function(renderer, writeBuffer, readBuffer) {
        var scene = this.scene,
            camera = this.camera,
            options = this.options;

        scene.overrideMaterial = options.overrideMaterial;

        if (options.clearColor) {
            this.clearColor.copy(renderer.getClearColor());
            this.clearAlpha = renderer.getClearAlpha();

            renderer.setClearColor(options.clearColor, options.clearAlpha);
        }

        this.render(renderer, scene, camera, readBuffer);

        if (options.clearColor) {
            renderer.setClearColor(this.clearColor, this.clearAlpha);
        }

        scene.overrideMaterial = null;
    }
});

module.exports = RenderPass;
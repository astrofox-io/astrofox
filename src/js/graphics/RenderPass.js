'use strict';

var _ = require('lodash');
var THREE = require('three');
var ComposerPass = require('../graphics/ComposerPass.js');

var defaults = {
    forceClear: true,
    overrideMaterial: null,
    setClearColor: null,
    setClearAlpha: 1.0
};

var RenderPass = function(scene, camera, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    this.scene = scene;
    this.camera = camera;
};

RenderPass.prototype = _.create(ComposerPass.prototype, {
    constructor: RenderPass,

    process: function(renderer, writeBuffer, readBuffer) {
        var scene = this.scene,
            camera = this.camera,
            options = this.options;

        scene.overrideMaterial = options.overrideMaterial;

        this.render(renderer, scene, camera, readBuffer);

        scene.overrideMaterial = null;
    }
});

module.exports = RenderPass;
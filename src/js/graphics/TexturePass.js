'use strict';

var _ = require('lodash');
var THREE = require('three');
var ComposerPass = require('../graphics/ComposerPass.js');

var defaults = {
    color: 0xffffff,
    opacity: 1.0,
    transparent: true,
    needsSwap: false,
    needsUpdate: true,
    forceClear: false,
    depthTest: true,
    depthWrite: true,
    blending: THREE.NormalBlending
};

var TexturePass = function(texture, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    this.texture = texture;

    this.material = new THREE.MeshBasicMaterial({
        map: texture,
        color: this.options.color,
        depthTest: this.options.depthTest,
        depthWrite: this.options.depthWrite,
        transparent: this.options.transparent,
        blending: this.options.blending
    });

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.geometry = new THREE.PlaneBufferGeometry(2, 2);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
};

TexturePass.prototype = _.create(ComposerPass.prototype, {
    constructor: TexturePass,

    process: function(renderer, writeBuffer, readBuffer) {
        var options = this.options;

        this.texture.needsUpdate = options.needsUpdate;

        this.render(renderer, this.scene, this.camera, readBuffer);
    }
});

module.exports = TexturePass;
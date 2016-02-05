'use strict';

var _ = require('lodash');
var THREE = require('three');
var ComposerPass = require('../graphics/ComposerPass.js');

var defaults = {
    opacity: 1.0,
    transparent: true,
    needsSwap: false,
    needsUpdate: true,
    forceClear: false,
    blending: THREE.NormalBlending
};

var TexturePass = function(texture, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    this.texture = texture;

    this.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
        depthTest: false,
        depthWrite: false,
        transparent: this.options.transparent,
        blending: this.options.blending
    });

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.plane = new THREE.PlaneBufferGeometry(2, 2);
    this.mesh = new THREE.Mesh(this.plane, this.material);
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
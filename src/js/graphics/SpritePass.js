'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('core/Class.js');
var ComposerPass = require('graphics/ComposerPass.js');

var defaults = {
    opacity: 1.0,
    transparent: true,
    needsSwap: false,
    needsUpdate: true,
    forceClear: true,
    width: 854,
    height: 480
};

var SpritePass = function(texture, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    var height = this.options.height,
        width = this.options.width;

    this.texture = texture;

    this.material = new THREE.SpriteMaterial({
        map: texture,
        transparent : true
    });

    this.sprite = new THREE.Sprite(this.material);
    this.sprite.scale.set(width, height, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 1);

    this.scene.add(this.sprite);
};

Class.extend(SpritePass, ComposerPass, {
    render: function(renderer, writeBuffer, readBuffer) {
        var options = this.options;

        this.texture.needsUpdate = options.needsUpdate;

        this.process(renderer, this.scene, this.camera, readBuffer);
    }
});

module.exports = SpritePass;
'use strict';

const THREE = require('three');
const ComposerPass = require('../graphics/ComposerPass.js');

const defaults = {
    opacity: 1.0,
    transparent: true,
    needsSwap: false,
    needsUpdate: true,
    forceClear: true,
    width: 854,
    height: 480
};

class SpritePass extends ComposerPass {
    constructor(texture, options) {
        super(Object.assign({}, defaults, options));

        let height = this.options.height,
            width = this.options.width;

        this.texture = texture;

        this.material = new THREE.SpriteMaterial({
            color: this.options.color,
            map: texture,
            transparent : this.options.transparent
        });

        this.sprite = new THREE.Sprite(this.material);
        this.sprite.scale.set(width, height, 0);

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 1);

        this.scene.add(this.sprite);
    }

    process(renderer, writeBuffer, readBuffer) {
        let options = this.options;

        this.texture.needsUpdate = options.needsUpdate;

        this.render(renderer, this.scene, this.camera, readBuffer);
    }
}

module.exports = SpritePass;
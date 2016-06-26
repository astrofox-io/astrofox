'use strict';

const THREE = require('three');
const ComposerPass = require('../graphics/ComposerPass.js');

const defaults = {
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

class TexturePass extends ComposerPass {
    constructor(texture, options) {
        super(Object.assign({}, defaults, options));

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
    }

    process(renderer, writeBuffer, readBuffer) {
        var options = this.options;

        this.texture.needsUpdate = options.needsUpdate;

        this.render(renderer, this.scene, this.camera, readBuffer);
    }
}

module.exports = TexturePass;
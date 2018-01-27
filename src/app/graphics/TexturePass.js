import * as THREE from 'three';
import ComposerPass from 'graphics/ComposerPass';

const defaults = {
    color: 0xffffff,
    opacity: 1.0,
    transparent: true,
    needsSwap: false,
    needsUpdate: true,
    forceClear: false,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending
};

export default class TexturePass extends ComposerPass {
    constructor(texture, options) {
        super(Object.assign({}, defaults, options));

        let { color, depthTest, depthWrite, transparent, blending } = this.options;

        this.texture = texture;

        this.material = new THREE.MeshBasicMaterial({
            map: texture,
            color: color,
            depthTest: depthTest,
            depthWrite: depthWrite,
            transparent: transparent,
            blending: blending
        });

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.geometry = new THREE.PlaneBufferGeometry(2, 2);

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.frustumCulled = false;

        this.scene.add(this.mesh);
    }

    render(renderer, writeBuffer, readBuffer) {
        let { needsUpdate } = this.options;

        this.texture.needsUpdate = needsUpdate;

        super.render(renderer, this.scene, this.camera, readBuffer);
    }
}
import ComposerPass from './ComposerPass';

const defaults = {
    forceClear: true,
    overrideMaterial: null,
    setClearColor: null,
    setClearAlpha: 1.0
};

export default class RenderPass extends ComposerPass {
    constructor(scene, camera, options) {
        super(Object.assign({}, defaults, options));

        this.scene = scene;
        this.camera = camera;
    }

    render(renderer, writeBuffer, readBuffer) {
        let scene = this.scene,
            camera = this.camera,
            { overrideMaterial } = this.options;

        if (overrideMaterial) {
            scene.overrideMaterial = overrideMaterial;
        }

        super.render(renderer, scene, camera, readBuffer);

        scene.overrideMaterial = null;
    }
}
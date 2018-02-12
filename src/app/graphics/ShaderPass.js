import * as THREE from 'three';
import ComposerPass from 'graphics/ComposerPass';

export default class ShaderPass extends ComposerPass {
    static defaults = {
        textureId: 'tDiffuse',
        transparent: false,
        needsSwap: true,
        forceClear: false,
        blending: THREE.NormalBlending,
    }

    constructor(shader, options) {
        super(Object.assign({}, ShaderPass.defaults, options));

        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            defines: shader.defines || {},
            transparent: this.options.transparent,
            blending: this.options.blending,
        });

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.geometry = new THREE.PlaneBufferGeometry(2, 2);

        this.mesh = new THREE.Mesh(this.geometry, null);
        this.mesh.material = this.material;
        this.mesh.frustumCulled = false;

        this.scene.add(this.mesh);
    }

    setUniforms(props) {
        const { uniforms } = this;

        Object.keys(props).forEach((prop) => {
            if (Object.prototype.hasOwnProperty.call(uniforms, prop)) {
                const p = uniforms[prop].value;

                if (p !== null && typeof p.set !== 'undefined') {
                    p.set(...props[prop]);
                }
                else {
                    uniforms[prop].value = props[prop];
                }
            }
        });

        this.material.needsUpdate = true;
    }

    render(renderer, writeBuffer, readBuffer) {
        const { scene, camera, material } = this;
        const { textureId } = this.options;

        if (readBuffer && material.uniforms[textureId]) {
            material.uniforms[textureId].value = readBuffer;
        }

        super.render(renderer, scene, camera, writeBuffer);
    }
}

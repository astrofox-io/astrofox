import * as THREE from 'three';
import ComposerPass from './ComposerPass';

const defaults = {
    textureId: 'tDiffuse',
    transparent: false,
    needsSwap: true,
    forceClear: false,
    blending: THREE.NormalBlending
};

export default class ShaderPass extends ComposerPass {
    constructor(shader, options) {
        super(Object.assign({}, defaults, options));

        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            defines: shader.defines || {},
            transparent: this.options.transparent,
            blending: this.options.blending
        });

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.geometry = new THREE.PlaneBufferGeometry(2, 2);
        this.mesh = new THREE.Mesh(this.geometry, null);
        this.mesh.material = this.material;
        this.scene.add(this.mesh);
    }
    
    setUniforms(props) {
        let uniforms = this.uniforms;

        Object.keys(props).forEach(prop => {
            if (uniforms.hasOwnProperty(prop)) {
                let p = uniforms[prop].value;
                if (p != null && typeof p.set !== 'undefined') {
                    p.set.apply(p, props[prop]);
                }
                else {
                    uniforms[prop].value = props[prop];
                }
            }
        });

        this.material.needsUpdate = true;
    }

    render(renderer, writeBuffer, readBuffer) {
        let options = this.options;

        if (readBuffer && this.material.uniforms[options.textureId] ) {
            this.material.uniforms[options.textureId].value = readBuffer;
        }

        super.render(renderer, this.scene, this.camera, writeBuffer);
    }
}
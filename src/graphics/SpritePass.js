import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
} from 'three';
import Pass from './Pass';

export default class SpritePass extends Pass {
  constructor(texture, { width, height }) {
    super();

    this.texture = texture;

    this.material = new MeshBasicMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    this.scene = new Scene();
    this.camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0, 1);

    this.geometry = new PlaneBufferGeometry(texture.image.width, texture.image.height);

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
  }

  render(renderer, inputBuffer) {
    const { scene, camera } = this;

    super.render(renderer, scene, camera, inputBuffer);
  }
}

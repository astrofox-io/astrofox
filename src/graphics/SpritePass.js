import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Sprite,
  SpriteMaterial,
  Scene,
  TextureLoader, RepeatWrapping,
} from 'three';
import Pass from './Pass';
import { getFullscreenGeometry } from './common';

export default class SpritePass extends Pass {
  constructor(texture, res) {
    super();

    const { width, height } = res;

    console.log('PASS', width, height)

    this.texture = texture;
    //this.texture.wrapS = RepeatWrapping;
    //this.texture.wrapT = RepeatWrapping;

    this.material = new MeshBasicMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      //color: 0xffffff,
      //wireframe: true,
    });

    this.scene = new Scene();
    //this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0, 1);
    //this.camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
    //this.camera.position.z = 20;
    //this.geometry = new PlaneBufferGeometry(2, 2);

    this.geometry = new PlaneBufferGeometry(texture.image.width, texture.image.height);

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);

    this.needsUpdate = true;

    console.log('PASS', this);
  }

  render(renderer, inputBuffer) {
    const { scene, camera, texture, needsUpdate } = this;

    texture.needsUpdate = needsUpdate;

    super.render(renderer, scene, camera, inputBuffer);
  }
}

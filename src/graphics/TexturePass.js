import { MeshBasicMaterial } from 'three';
import Pass from './Pass';

export default class TexturePass extends Pass {
  constructor(texture) {
    super();

    this.texture = texture;

    this.material = new MeshBasicMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    this.setFullscreen(this.material);

    this.needsUpdate = true;
  }

  render(renderer, inputBuffer) {
    const { scene, camera, texture, needsUpdate } = this;

    texture.needsUpdate = needsUpdate;

    super.render(renderer, scene, camera, inputBuffer);
  }
}

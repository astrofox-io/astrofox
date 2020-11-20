import { MeshBasicMaterial } from 'three';
import Pass from './Pass';

export default class TexturePass extends Pass {
  static defaultProperties = {
    color: 0xffffff,
    opacity: 1.0,
    transparent: true,
    needsSwap: false,
    needsUpdate: true,
    depthTest: false,
    depthWrite: false,
  };

  constructor(texture, properties) {
    super({ ...TexturePass.defaultProperties, ...properties });

    const { color, depthTest, depthWrite, transparent } = this;

    this.texture = texture;

    this.material = new MeshBasicMaterial({
      map: texture,
      color,
      depthTest,
      depthWrite,
      transparent,
    });

    this.setFullscreenMaterial(this.material);
  }

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera, texture, needsUpdate } = this;

    texture.needsUpdate = needsUpdate;

    super.render(renderer, scene, camera, readBuffer);
  }
}

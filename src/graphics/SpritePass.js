import { SpriteMaterial, Sprite, Scene, OrthographicCamera } from 'three';
import Pass from 'graphics/Pass';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from 'view/constants';

export default class SpritePass extends Pass {
  static defaultProperties = {
    opacity: 1.0,
    transparent: true,
    needsUpdate: true,
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  };

  constructor(texture, properties) {
    super({ ...SpritePass.defaultProperties, ...properties });

    const { height, width, color, transparent } = this;

    this.texture = texture;

    this.material = new SpriteMaterial({
      map: texture,
      color,
      transparent,
    });

    this.sprite = new Sprite(this.material);
    this.sprite.scale.set(width, height, 0);

    this.scene = new Scene();
    this.camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 1);

    this.scene.add(this.sprite);
  }

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera, texture } = this;
    const { needsUpdate } = this.properties;

    texture.needsUpdate = needsUpdate;

    super.render(renderer, scene, camera, readBuffer);
  }
}

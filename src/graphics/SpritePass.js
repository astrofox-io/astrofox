import { SpriteMaterial, Sprite, Scene, OrthographicCamera } from 'three';
import ComposerPass from 'graphics/ComposerPass';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from 'view/constants';

export default class SpritePass extends ComposerPass {
  static defaultOptions = {
    opacity: 1.0,
    transparent: true,
    needsSwap: false,
    needsUpdate: true,
    forceClear: true,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  };

  constructor(texture, properties) {
    super({ ...SpritePass.defaultOptions, ...properties });

    const { height, width } = this.properties;

    this.texture = texture;

    this.material = new SpriteMaterial({
      color: this.properties.color,
      map: texture,
      transparent: this.properties.transparent,
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

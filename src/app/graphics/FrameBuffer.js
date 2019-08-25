import { Texture, LinearFilter } from 'three';
import TexturePass from 'graphics/TexturePass';

export default class FrameBuffer {
  constructor() {
    this.canvas = document.createElement('canvas');

    this.texture = new Texture(this.canvas);
    this.texture.minFilter = LinearFilter;
    this.texture.needsUpdate = true;

    this.pass = new TexturePass(this.texture);
  }
}

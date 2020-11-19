import { Texture } from 'three';
import TexturePass from './TexturePass';

export default class CanvasBuffer {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');

    this.texture = new Texture(this.canvas);

    this.pass = new TexturePass(this.texture);

    this.context = this.canvas.getContext('2d');

    this.setSize(width, height);
  }

  getContext() {
    return this.context;
  }

  setSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

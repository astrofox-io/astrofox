import FrameBuffer from './FrameBuffer';

export default class CanvasBuffer extends FrameBuffer {
  constructor(width, height) {
    super();

    this.context = this.canvas.getContext('2d');

    this.setSize(width, height);
  }

  setSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

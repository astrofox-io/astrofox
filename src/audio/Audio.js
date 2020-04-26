export default class Audio {
  constructor(context) {
    this.audioContext = context;
    this.source = null;
    this.buffer = null;
    this.startTime = 0;
    this.stopTime = 0;
    this.nodes = [];
    this.playing = false;
    this.paused = false;
    this.repeat = false;
  }

  load(src) {
    if (typeof src === 'string') {
      return this.loadUrl(src);
    } else if (src instanceof ArrayBuffer) {
      return this.loadData(src);
    } else if (src instanceof AudioBuffer) {
      return this.loadBuffer(src);
    }

    throw new Error(`Invalid source: ${typeof src}`);
  }

  unload() {
    if (this.source) {
      this.stop();
      this.source = null;
      this.buffer = null;
    }
  }

  // Loads a url via AJAX
  async loadUrl(url) {
    const response = await fetch(url);
    return this.loadData(response);
  }

  // Decodes an ArrayBuffer into an AudioBuffer
  async loadData(data) {
    const buffer = await this.audioContext.decodeAudioData(data);
    return this.loadBuffer(buffer);
  }

  // Loads an AudioBuffer
  loadBuffer(buffer) {
    this.buffer = buffer;
    this.initBuffer();
  }

  addNode(node) {
    if (this.nodes.indexOf(node) < 0) {
      this.nodes.push(node);
    }
  }

  removeNode(node) {
    const index = this.nodes.indexOf(node);

    if (index > -1) {
      this.nodes.splice(index, 1);
    }
  }

  reconnectNodes() {
    this.nodes.forEach(node => {
      this.source.connect(node);
    });
  }

  disconnectNodes() {
    this.nodes.forEach(node => {
      node.disconnect();
    });
  }

  initBuffer() {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;

    this.reconnectNodes();
  }

  play() {
    if (this.buffer) {
      this.initBuffer();

      this.startTime = this.audioContext.currentTime;
      this.source.start(0, this.getCurrentTime());
      this.playing = true;
      this.paused = false;
    }
  }

  pause() {
    if (this.source) {
      this.source.stop();
      this.source = null;
    }

    this.stopTime += this.audioContext.currentTime - this.startTime;
    this.playing = false;
    this.paused = true;
  }

  stop() {
    if (this.source) {
      if (this.playing) this.source.stop();
      this.source.disconnect();
      this.source = null;
    }

    this.stopTime = 0;
    this.playing = false;
    this.paused = false;
  }

  seek(pos) {
    if (this.playing) {
      this.stop();
      this.updatePosition(pos);
      this.play();
    } else {
      this.updatePosition(pos);
    }
  }

  getCurrentTime() {
    return this.playing
      ? this.stopTime + (this.audioContext.currentTime - this.startTime)
      : this.stopTime;
  }

  getDuration() {
    return this.buffer ? this.buffer.duration : 0;
  }

  getPosition() {
    return this.getCurrentTime() / this.getDuration() || 0;
  }

  updatePosition(pos) {
    this.stopTime = ~~(pos * this.buffer.duration);
  }
}

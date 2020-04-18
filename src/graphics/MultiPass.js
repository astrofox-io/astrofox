import ComposerPass from 'graphics/ComposerPass';

export default class MultiPass extends ComposerPass {
  static defaultOptions = {
    needsSwap: true,
    forceClear: true,
    clearDepth: true,
  };

  constructor(passes, properties) {
    super({ ...MultiPass.defaultOptions, ...properties });

    this.passes = passes;
  }

  addPass(pass) {
    this.passes.push(pass);

    return pass;
  }

  removePass(pass) {
    this.passes = this.passes.filter(p => p !== pass);
  }

  setSize(width, height) {
    this.passes.forEach(pass => {
      pass.setSize(width, height);
    });
  }

  render(renderer, writeBuffer, readBuffer, callback) {
    this.writeBuffer = writeBuffer;
    this.readBuffer = readBuffer;

    this.passes.forEach(pass => {
      if (pass.properties.enabled) {
        pass.render(renderer, this.writeBuffer, this.readBuffer);

        if (pass.properties.needsSwap) {
          const tmp = this.readBuffer;
          this.readBuffer = this.writeBuffer;
          this.writeBuffer = tmp;
        }
      }
    });

    if (callback) {
      callback();
    }
  }
}

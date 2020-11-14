import Pass from './Pass';

export default class MultiPass extends Pass {
  static defaultProperties = {
    needsSwap: true,
    clearDepth: true,
  };

  constructor(passes = [], properties) {
    super({ ...MultiPass.defaultProperties, ...properties });

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

  setUniforms(uniforms) {
    for (const pass of this.passes) {
      if (pass.setUniforms) {
        pass.setUniforms(uniforms);
      }
    }
  }

  render(renderer, writeBuffer, readBuffer) {
    this.writeBuffer = writeBuffer;
    this.readBuffer = readBuffer;

    this.passes.forEach(pass => {
      pass.render(renderer, this.writeBuffer, this.readBuffer);

      if (pass.needsSwap) {
        const tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;
      }
    });
  }
}

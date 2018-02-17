import ComposerPass from 'graphics/ComposerPass';

export default class MultiPass extends ComposerPass {
    static defaults = {
        needsSwap: true,
        forceClear: true,
        clearDepth: true,
    }

    constructor(passes, options) {
        super(Object.assign({}, MultiPass.defaults, options));

        this.passes = [];
    }

    getPasses() {
        return this.passes;
    }

    addPass(pass) {
        this.passes.push(pass);

        return pass;
    }

    removePass(pass) {
        this.passes = this.passes.filter(p => p !== pass);
    }

    setSize(width, height) {
        this.getPasses().forEach((pass) => {
            pass.setSize(width, height);
        });
    }

    render(renderer, writeBuffer, readBuffer, callback) {
        this.writeBuffer = writeBuffer;
        this.readBuffer = readBuffer;

        this.passes.forEach((pass) => {
            if (pass.options.enabled) {
                pass.render(renderer, this.writeBuffer, this.readBuffer);

                if (pass.options.needsSwap) {
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

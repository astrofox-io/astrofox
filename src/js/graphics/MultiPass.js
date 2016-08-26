'use strict';

const ComposerPass = require('../graphics/ComposerPass');
const CopyShader = require('../shaders/CopyShader');
const NodeCollection = require('../core/NodeCollection');

const defaults = {
    needsSwap: true,
    forceClear: true,
    clearDepth: true
};

class MultiPass extends ComposerPass { 
    constructor(passes, options) {
        super(Object.assign({}, defaults, options));
    
        this.passes = new NodeCollection(passes);
    }

    getPasses() {
        return this.passes.nodes;
    }

    addPass(pass) {
        this.passes.addNode(pass);

        return pass;
    }

    removePass(pass) {
        this.passes.removeNode(pass);
    }

    render(renderer, writeBuffer, readBuffer, callback) {
        this.writeBuffer = writeBuffer;
        this.readBuffer = readBuffer;

        this.getPasses().forEach(pass => {
            if (pass.options.enabled) {
                pass.render(renderer, this.writeBuffer, this.readBuffer);

                if (pass.options.needsSwap) {
                    let tmp = this.readBuffer;
                    this.readBuffer = this.writeBuffer;
                    this.writeBuffer = tmp;
                }
            }
        });
    }
}

module.exports = MultiPass;
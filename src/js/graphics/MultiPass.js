'use strict';

const ComposerPass = require('../graphics/ComposerPass.js');
const CopyShader = require('../shaders/CopyShader.js');
const NodeCollection = require('../core/NodeCollection.js');

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
}

module.exports = MultiPass;
'use strict';

var _ = require('lodash');
var THREE = require('three');
var NodeCollection = require('../core/NodeCollection.js');
var ComposerPass = require('../graphics/ComposerPass.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var CopyShader = require('../shaders/CopyShader.js');

var defaults = {
    needsSwap: true,
    forceClear: true,
    clearDepth: true
};

var MultiPass = function(passes, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    this.passes = new NodeCollection(passes);
};

MultiPass.prototype = _.create(ComposerPass.prototype, {
    constructor: MultiPass,

    getPasses: function() {
        return this.passes.nodes;
    },

    addPass: function(pass) {
        this.passes.addNode(pass);

        return pass;
    },

    removePass: function(pass) {
        this.passes.removeNode(pass);
    }
});

module.exports = MultiPass;
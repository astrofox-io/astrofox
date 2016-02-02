'use strict';

var _ = require('lodash');

var Class = require('../core/Class.js');
var ShaderPass = require('../graphics/ShaderPass.js');
var CopyShader = require('../shaders/CopyShader.js');

var defaults = {
    transparent: true,
    needsSwap: false,
    forceClear: true
};

var SavePass = function(buffer, options) {
    ShaderPass.call(this, CopyShader, _.assign({}, defaults, options));

    this.buffer = buffer;
};

Class.extend(SavePass, ShaderPass, {
    process: function(renderer, writeBuffer, readBuffer) {
        ShaderPass.prototype.process.call(this, renderer, this.buffer, readBuffer);
    }
});

module.exports = SavePass;
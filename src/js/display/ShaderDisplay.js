'use strict';

var Class = require('core/Class.js');
var Display = require('display/Display.js');

var ShaderDisplay = function(id, name, options) {
    Display.call(this, id, name, options);
};

Class.extend(ShaderDisplay, Display, {

});

module.exports = ShaderDisplay;
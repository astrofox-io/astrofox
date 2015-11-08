'use strict';

var Class = require('core/Class.js');
var Display = require('display/Display.js');

var Effect = function(name, options) {
    Display.call(this, name, options);
};

Class.extend(Effect, Display, {

});

module.exports = Effect;
'use strict';

var Class = require('core/Class.js');
var Display = require('display/Display.js');

var Effect = function(id, name, options) {
    Display.call(this, id, name, options);
};

Class.extend(Effect, Display, {

});

module.exports = Effect;
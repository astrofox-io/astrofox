'use strict';

var Class = require('../core/Class.js');
var Display = require('../display/Display.js');

var Effect = function(name, options) {
    Display.call(this, name, options);
};

Class.extend(Effect, Display, {
    update: function(options) {
        if (this.pass && options.enabled !== undefined) {
            this.pass.options.enabled = options.enabled;
        }

        return Display.prototype.update.call(this, options);
    }
});

module.exports = Effect;
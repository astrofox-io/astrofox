'use strict';

var _ = require('lodash');
var Display = require('../display/Display.js');

var Effect = function(name, options) {
    Display.call(this, name, options);
};

Effect.prototype = _.create(Display.prototype, {
    constructor: Effect,

    update: function(options) {
        if (this.pass && options && options.enabled !== undefined) {
            this.pass.options.enabled = options.enabled;
        }

        return Display.prototype.update.call(this, options);
    },

    setPass: function(pass) {
        this.pass = pass;
        pass.options.enabled = this.options.enabled;

        this.owner.updatePasses();
    }
});

module.exports = Effect;
'use strict';

var _ = require('lodash');
var EventEmitter = require('../core/EventEmitter.js');

var defaults = {
    enabled: true
};

var id = 0;

var Display = function(name, options) {
    this.id = id++;
    this.name = name;
    this.options = _.assign({ displayName: name + '' + id }, defaults, options);
    this.owner = null;
    this.hasUpdate = false;
    this.initialized = false;
};

Display.prototype = _.create(EventEmitter.prototype, {
    constructor: Display,

    update: function(options) {
        if (options) {
            for (var prop in options) {
                if (options.hasOwnProperty(prop) && this.options.hasOwnProperty(prop)) {
                    if (this.options[prop] !== options[prop]) {
                        this.options[prop] = options[prop];
                        this.hasUpdate = true;
                    }
                }
            }

            this.initialized = true;
        }

        return this.hasUpdate;
    },

    toString: function() {
        return this.name + '' + this.id;
    },

    toJSON: function() {
        return {
            name: this.name,
            options: this.options
        };
    }
});

module.exports = Display;
'use strict';

var _ = require('lodash');
var Class = require('../core/Class.js');
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

Class.extend(Display, EventEmitter, {
    update: function(options) {
        if (typeof options === 'object') {
            for (var prop in options) {
                if (this.options.hasOwnProperty(prop)) {
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
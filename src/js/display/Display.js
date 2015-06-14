"use strict";

var _ = require('lodash');
var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');

var Display = function(id, name, options) {
    this.id = id;
    this.name = name;
    this.displayName = name + '' + id;
    this.options = _.assign({}, options);
    this.owner = null;
    this.initialized = false;
};

Class.extend(Display, EventEmitter, {
    update: function(options) {
        var changed = false;

        if (typeof options === 'object') {
            for (var prop in options) {
                if (this.options.hasOwnProperty(prop)) {
                    if (this.options[prop] !== options[prop]) {
                        this.options[prop] = options[prop];
                        changed = true;
                    }
                }
            }

            this.initialized = true;
        }

        return changed;
    },

    toString: function() {
        return this.name + '' + this.id;
    },

    toJSON: function() {
        return {
            name: this.name,
            values: this.options
        };
    }
});

module.exports = Display;
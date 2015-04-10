"use strict";

var Class = require('../core/Class.js');
var EventEmitter = require('../core/EventEmitter.js');

var DisplayComponent = function() {
    this.initialized = false;
};

Class.extend(DisplayComponent, EventEmitter, {
    init: function (options) {
        if (typeof options !== 'undefined') {
            for (var prop in options) {
                if (this.options.hasOwnProperty(prop)) {
                    this.options[prop] = options[prop];
                }
            }

            this.initialized = true;
            this.emit('init');
        }
    },

    toString: function () {
        return this.name + '' + this.id;
    },

    toJSON: function () {
        return {
            name: this.name,
            values: this.options
        };
    }
});

module.exports = DisplayComponent;
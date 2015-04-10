"use strict";

var Class = require('../core/Class.js');
var EventEmitter = require('../core/EventEmitter.js');

var DisplayComponent = function(id, name, type, canvas) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.options = {};
    this.initialized = false;
    this.canvas = canvas || document.createElement('canvas');
    this.context = (type === '3d') ?
        this.canvas.getContext('webgl') :
        this.canvas.getContext('2d');
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
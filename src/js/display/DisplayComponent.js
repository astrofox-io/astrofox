"use strict";

var _ = require('lodash');
var Class = require('../core/Class.js');
var EventEmitter = require('../core/EventEmitter.js');

var DisplayComponent = function(id, name, type, canvas, options) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.canvas = canvas || document.createElement('canvas');

    this.context = (type === '3d') ?
        this.canvas.getContext('webgl') :
        this.canvas.getContext('2d');

    this.options = _.assign({ displayName: name + '' + id }, options);
    this.initialized = false;
};

Class.extend(DisplayComponent, EventEmitter, {
    init: function (options) {
        var changed = false;

        if (typeof options !== 'undefined') {
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
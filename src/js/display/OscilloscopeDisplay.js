'use strict';

var _ = require('lodash');
var Display = require('display/Display.js');

var defaults = {
    height: 200,
    width: 400,
    color: '#ffffff',
    lineWidth: 2,
    rotation: 0,
    opacity: 1.0
};

var OscilloscopeDisplay = function(canvas, options) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.options = _.assign({}, defaults);

    this.update(options);
};

OscilloscopeDisplay.prototype = {
    constructor: OscilloscopeDisplay,

    update: function(options) {
        if (typeof options !== 'undefined') {
            for (var prop in options) {
                if (hasOwnProperty.call(this.options, prop)) {
                    this.options[prop] = options[prop];

                    if (prop === 'width') {
                        this.canvas.width = options.width;
                    }
                    else if (prop === 'height') {
                        this.canvas.height = options.height;
                    }
                }
            }
        }
    },

    render: function(data) {
        var i, x, y,
            context = this.context,
            options = this.options,
            width = options.width,
            height = options.height,
            len = data.length,
            halfHeight = height / 2,
            step = len / width;

        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.color;

        context.clearRect(0, 0, width, height);
        context.beginPath();

        for(i = 0, x = 0; x < width; i += step, x++) {
            y = ((data[~~i] * height) + height) / 2;

            if (i === 0) {
                context.moveTo(x, y);
            }
            else {
                context.lineTo(x, y);
            }
        }

        context.stroke();
    }
};

module.exports = OscilloscopeDisplay;
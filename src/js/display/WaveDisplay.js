'use strict';

var _ = require('lodash');
var Display = require('./Display.js');

var defaults = {
    height: 200,
    width: 400,
    color: '#ffffff',
    lineWidth: 1.0,
    scrolling: false,
    scrollSpeed: 0.15,
    rotation: 0,
    opacity: 1.0
};

var WaveDisplay = function(canvas, options) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.options = _.assign({}, defaults);
    this.buffer = [];

    this.update(options);
};

WaveDisplay.prototype = {
    update: function(options) {
        var changed = Display.prototype.update.call(this, options);

        if (changed) {
            if (options.width !== undefined) {
                this.canvas.width = options.width;
            }
            if (options.height !== undefined) {
                this.canvas.height = options.height;
            }
        }

        return changed;
    },

    parseData: function(data, width, height) {
        var i, x, y,
            len = data.length,
            step = len / width,
            buffer = [];

        for (i = 0, x = 0; x < width; i += step, x++) {
            y = ((data[~~i] * height) + height) / 2;
            buffer[x] = y;
        }

        return buffer;
    },

    render: function(data, playing) {
        var i, len, buffer, size, slice,
            context = this.context,
            options = this.options,
            width = options.width,
            height = options.height;

        // Canvas setup
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.color;
        context.globalAlpha = options.opacity;

        // Get data values
        if (options.scrolling) {
            if (playing) {
                buffer = new Array(width);
                len = this.buffer.length;

                for (i = 0; i < len; i++) {
                    buffer[i] = this.buffer[i];
                }

                size = ~~(width * options.scrollSpeed * 0.3);
                slice = this.parseData(data, size, height);
                buffer = buffer.splice(size);
                buffer = buffer.concat(slice);

                this.buffer = buffer;
            }
            else {
                buffer = this.buffer;
            }
        }
        else {
            buffer = this.parseData(data, width, height);
        }

        // Draw wave
        context.clearRect(0, 0, width, height);
        context.beginPath();

        for (i = 0; i < width; i++) {
            if (i === 0) {
                context.moveTo(i, buffer[i]);
            }
            else {
                context.lineTo(i, buffer[i]);
            }
        }

        context.stroke();
    }
};

module.exports = WaveDisplay;
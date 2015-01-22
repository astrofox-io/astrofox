'use strict';

var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');

var defaults = {
    text: '',
    size: 20,
    font: 'sans-serif',
    italic: false,
    bold: false,
    x: 100,
    y: 100,
    color: '#ffffff',
    opacity: 1.0
};

var TextDisplay = EventEmitter.extend({
    constructor: function(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.options = {};

        this.init(this.options);
    }
});

TextDisplay.prototype.init = function(options) {
    this.options = _.assign({}, defaults, options);
};

TextDisplay.prototype.render = function() {
    var width, height,
        canvas = this.canvas,
        context = this.context,
        options = this.options,
        font = this.getFont();

    if (options.text.length == 0) return;

    context.font = font;
    width = Math.ceil(context.measureText(options.text).width);
    height = options.size * 2;

    // Fix for text clipping
    width += width/options.text.length;

    // Reset canvas
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = font;
    context.fillStyle = options.color;
    context.textBaseline = 'middle';
    context.globalAlpha = options.opacity;
    context.fillText(options.text, 0, options.size);

    /*
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2;
    context.strokeStyle = 'red';
    context.stroke();
    */
};

TextDisplay.prototype.getFont = function() {
    var options = this.options,
        font = [
            (options.italic) ? 'italic' : 'normal',
            (options.bold) ? 'bold' : 'normal',
            options.size + 'px',
            options.font
        ];

    return font.join(' ');
};

module.exports = TextDisplay;

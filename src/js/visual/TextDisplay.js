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
    color: '#ffffff'
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
    var canvas = this.canvas,
        context = this.context,
        options = this.options,
        font = this.getFont();

    context.font = font;
    canvas.width = context.measureText(options.text).width * ((options.italic) ? 1.1 : 1.0);
    canvas.height = options.size;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.font = font;
    context.fillStyle = options.color;
    context.textBaseline = 'top';
    context.fillText(options.text, 0, 0);

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

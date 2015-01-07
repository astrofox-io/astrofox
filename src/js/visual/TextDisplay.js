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
    canvas.height = options.size * 2;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.font = font;
    context.fillStyle = options.color;
    context.fillText(options.text, 0, options.size);

    /*
    var message = "AstroFox";
    var size = context.measureText(message);
    context.fillText(message, canvas.width / 2 - size.width / 2, canvas.height / 2 + 48/2);
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

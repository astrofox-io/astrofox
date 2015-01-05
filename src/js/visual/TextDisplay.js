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
    this.options = _.assign(this.options, defaults, options);
};

TextDisplay.prototype.render = function() {
    var context = this.context,
        options = this.options;

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.font = this.getFont();
    context.fillStyle = options.color;
    context.fillText(options.text, options.x, options.y);

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

'use strict';

var _ = require('lodash');
var THREE = require('three');

var Class = require('core/Class.js');
var Display = require('display/Display.js');
var CanvasDisplay = require('display/CanvasDisplay.js');

var defaults = {
    text: '',
    size: 20,
    font: 'sans-serif',
    italic: false,
    bold: false,
    x: 100,
    y: 100,
    color: '#ffffff',
    rotation: 0,
    opacity: 1.0
};

var id = 0;

var TextDisplay = function(options) {
    CanvasDisplay.call(this, id++, 'TextDisplay', defaults);

    this.update(options);
};

TextDisplay.info = {
    name: 'Text'
};

Class.extend(TextDisplay, CanvasDisplay, {
    render: function() {
        var width, height, length, spacing, r,
            canvas = this.canvas,
            context = this.context,
            options = this.options,
            font = this.getFont();

        context.font = font;

        length = Math.ceil(context.measureText(options.text).width);
        spacing = Math.ceil(length / options.text.length);
        width = length + spacing;
        height = options.size * 2;

        // Reset canvas
        canvas.width = width;
        canvas.height = height;
        //context.clearRect(0, 0, width, height);

        // Draw text
        context.font = font;
        context.fillStyle = options.color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.globalAlpha = options.opacity;
        context.fillText(options.text, width/2, height/2);

        // Debugging
        /*
        context.beginPath();
        context.rect(0, 0, canvas.width, canvas.height);
        context.lineWidth = 2;
        context.strokeStyle = 'red';
        context.stroke();
        */
    },

    getFont: function() {
        var options = this.options,
            font = [
                (options.italic) ? 'italic' : 'normal',
                (options.bold) ? 'bold' : 'normal',
                options.size + 'px',
                options.font
            ];

        return font.join(' ');
    }
});

module.exports = TextDisplay;

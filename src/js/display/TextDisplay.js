'use strict';

var _ = require('lodash');
var Class = require('../core/Class.js');
var DisplayComponent = require('./DisplayComponent.js');

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

var TextDisplay = function(canvas, options) {
    DisplayComponent.call(this, id++, 'TextDisplay', '2d', canvas, defaults);

    this.init(options);
};

TextDisplay.info = {
    name: 'Text'
};

Class.extend(TextDisplay, DisplayComponent, {
    render: function () {
        var width, height,
            canvas = this.canvas,
            context = this.context,
            options = this.options,
            font = this.getFont();

        context.font = font;
        width = Math.ceil(context.measureText(options.text).width);
        height = options.size * 2;

        // Fix for text clipping
        width += width / options.text.length;

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
    },

    renderToCanvas: function (context) {
        var options = this.options,
            width = this.canvas.width / 2,
            height = this.canvas.height / 2;

        if (options.rotation % 360 !== 0) {
            context.save();
            context.translate(options.x, options.y);
            context.translate(width, height);
            context.rotate(options.rotation * Math.PI / 180);
            context.drawImage(this.canvas, -width, -height);
            context.restore();
        }
        else {
            context.drawImage(this.canvas, options.x, options.y);
        }
    },

    getFont: function () {
        var options = this.options,
            font = [
                (options.italic) ? 'italic' : 'normal',
                (options.bold) ? 'bold' : 'normal',
                options.size + 'px',
                options.font
            ];

        return font.join(' ');
    },
});

module.exports = TextDisplay;

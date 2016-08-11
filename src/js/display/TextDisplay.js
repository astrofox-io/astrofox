'use strict';

const Display = require('../display/Display.js');
const CanvasDisplay = require('../display/CanvasDisplay.js');

class TextDisplay extends CanvasDisplay {
    constructor(options) {
        super(TextDisplay.className, Object.assign({}, TextDisplay.defaults, options));

        this.initialized = !!options;
    }

    render() {
        let width, height, length, spacing,
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
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
        context.clearRect(0, 0, width, height);

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
    }

    getFont() {
        let options = this.options,
            font = [
                (options.italic) ? 'italic' : 'normal',
                (options.bold) ? 'bold' : 'normal',
                options.size + 'px',
                options.font
            ];

        return font.join(' ');
    }
}

TextDisplay.label = 'Text';

TextDisplay.className = 'TextDisplay';

TextDisplay.defaults = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    x: 0,
    y: 0,
    color: '#FFFFFF',
    rotation: 0,
    opacity: 1.0
};

module.exports = TextDisplay;

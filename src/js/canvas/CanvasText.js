'use strict';

const Component = require('../core/Component.js');

const defaults = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    color: '#FFFFFF'
};

class CanvasText extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height + this.options.shadowHeight;

        this.context = this.canvas.getContext('2d');
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

        // Draw text
        context.font = font;
        context.fillStyle = options.color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        //context.globalAlpha = options.opacity;
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
}

module.exports = CanvasText;
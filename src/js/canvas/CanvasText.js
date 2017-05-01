/* eslint-disable react/require-render-return */
import Component from '../core/Component';

class CanvasText extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, CanvasText.defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;

        this.context = this.canvas.getContext('2d');
    }

    getFont() {
        let { italic, bold, size, font } = this.options;

        return [
            (italic) ? 'italic' : 'normal',
            (bold) ? 'bold' : 'normal',
            size + 'px',
            font
        ].join(' ');
    }

    render() {
        let width, height, length, spacing,
            canvas = this.canvas,
            context = this.context,
            font = this.getFont(),
            { text, size, color } = this.options;

        context.font = font;

        length = Math.ceil(context.measureText(text).width);
        spacing = Math.ceil(length / text.length);
        width = length + spacing;
        height = size * 2;

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
        else {
            context.clearRect(0, 0, width, height);
        }

        // Draw text
        context.font = font;
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, width/2, height/2);

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

CanvasText.defaults = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    color: '#FFFFFF'
};

export default CanvasText;
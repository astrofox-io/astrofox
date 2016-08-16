'use strict';

const Component = require('../core/Component.js');

class CanvasWave extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, CanvasWave.defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.buffer = new Float32Array(this.options.width);

        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
    }

    render(data) {
        let i, x, y,
            canvas = this.canvas,
            context = this.context,
            { width, height, color, lineWidth } = this.options,
            step = (data.length / width);

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
        else {
            context.clearRect(0, 0, width, height);
        }

        // Canvas setup
        context.lineWidth = lineWidth;
        context.strokeStyle = color;

        // Draw wave
        context.beginPath();

        for (i = 0, x = 0; x < width; i += step, x++) {
            y = data[~~i];
            if (i === 0) {
                context.moveTo(x, y);
            }
            else {
                context.lineTo(x, y);
            }
        }

        context.stroke();
    }
}

CanvasWave.defaults = {
    color: '#FFFFFF',
    width: 400,
    height: 200,
    lineWidth: 1.0,
    scrolling: false,
    scrollSpeed: 0.15
};

module.exports = CanvasWave;
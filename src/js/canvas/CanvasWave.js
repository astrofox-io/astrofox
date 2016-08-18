'use strict';

const Component = require('../core/Component.js');

class CanvasWave extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, CanvasWave.defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;

        this.context = this.canvas.getContext('2d');

        this.scrollBuffer = new Float32Array(this.options.width);
    }

    render(data, scroll) {
        let i, x, y, step, size,
            canvas = this.canvas,
            context = this.context,
            buffer = this.scrollBuffer,
            { width, height, color, lineWidth, scrolling, scrollSpeed } = this.options;

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
        else {
            context.clearRect(0, 0, width, height);
        }

        if (scroll) {
            if (buffer.length !== width) {
                this.scrollBuffer = new Float32Array(width);
            }

            // Parse scrolling data
            size = ~~(width * scrollSpeed * 0.3);
            step = data.length / size;

            // Move all elements down
            for (x = 0; x < width - size; x++) {
                buffer[x] = buffer[x + size];
            }

            // Insert new slice
            for (i = 0, x = width - size; x < width; i += step, x++) {
                buffer[x] = data[~~i];
            }
        }

        // Canvas setup
        context.lineWidth = lineWidth;
        context.strokeStyle = color;

        // Set data to draw
        data = (scrolling) ? buffer : data;

        // Draw wave
        context.beginPath();

        for (i = 0, x = 0, step = data.length / width; x < width; i += step, x++) {
            y = ((data[~~i] * height) + height) / 2;

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
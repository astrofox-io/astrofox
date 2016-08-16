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

    parseData(buffer, data, width, height) {
        let i, x, y,
            len = data.length,
            step = len / width;

        for (i = 0, x = 0; x < width; i += step, x++) {
            y = ((data[~~i] * height) + height) / 2;
            buffer[x] = y;
        }
    }

    render(data, playing) {
        let i, size,
            canvas = this.canvas,
            context = this.context,
            buffer = this.buffer,
            { width, height, color, lineWidth, scrolling, scrollSpeed } = this.options;

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            buffer = this.buffer = new Float32Array(width);
        }
        else {
            context.clearRect(0, 0, width, height);
        }

        // Canvas setup
        context.lineWidth = lineWidth;
        context.strokeStyle = color;

        // Get data values
        if (playing) {
            if (scrolling) {
                size = ~~(width * scrollSpeed * 0.3);

                // Move all elements down
                for (i = width; i >= size; i--) {
                    buffer[i] = buffer[i - size];
                }

                // Insert new slice
                this.parseData(buffer, data, size, height);
            }
            else {
                this.parseData(buffer, data, width, height);
            }
        }

        // Draw wave
        context.clearRect(0, 0, width, height);
        context.beginPath();

        for (i = 0; i < width; i++) {
            if (i === 0) {
                context.moveTo(i, buffer[i]);
            }
            else {
                context.lineTo(i, buffer[i]);
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
'use strict';

const Display = require('./Display.js');

class WaveDisplay extends Display {
    constructor(options, canvas) {
        super(WaveDisplay, options);

        this.canvas = canvas || document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.buffer = new Float32Array(this.options.width);

        canvas.width = this.options.width;
        canvas.height = this.options.height;
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            if (options.width !== undefined) {
                this.canvas.width = options.width;
                this.buffer = new Float32Array(options.width);
            }
            if (options.height !== undefined) {
                this.canvas.height = options.height;
            }
        }

        return changed;
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

    render(data) {
        let i, size,
            context = this.context,
            options = this.options,
            width = options.width,
            height = options.height,
            buffer = this.buffer;

        // Canvas setup
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.color;
        context.globalAlpha = options.opacity;

        // Get data values
        if (options.scrolling) {
            size = ~~(width * options.scrollSpeed * 0.3);

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

WaveDisplay.label = 'Wave';

WaveDisplay.className = 'WaveDisplay';

WaveDisplay.defaults = {
    height: 200,
    width: 400,
    color: '#FFFFFF',
    lineWidth: 1.0,
    scrolling: false,
    scrollSpeed: 0.15,
    rotation: 0,
    opacity: 1.0
};

module.exports = WaveDisplay;
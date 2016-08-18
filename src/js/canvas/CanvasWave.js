'use strict';

const { getCurvePoints } = require('cardinal-spline-js');

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
        let i, x, y, step, size, x1, y1, x2, y2,
            points = [],
            canvas = this.canvas,
            context = this.context,
            buffer = this.scrollBuffer,
            { width, height, color, lineWidth, scrolling, scrollSpeed, smoothing, smoothRatio } = this.options;

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

        // Set data source
        data = (scrolling) ? buffer : data;

        // Get points
        if (smoothing > 0) {
            size = ~~(width * smoothRatio * smoothing);
            if (size < 1) size = 1;
            step = data.length / (width / size);

            for (i = 0, x = 0; x < width; i += step, x += size) {
                points.push(x);
                points.push(((data[~~i] * height) + height) / 2);

                // Move last x point to the end
                if (x + size > width) {
                    points[points.length - 2] = width;
                }
            }

            points = getCurvePoints(points);
        }
        else {
            step = data.length / width;

            for (i = 0, x = 0; x < width; i += step, x++) {
                points.push(x);
                points.push((data[~~i] * height + height) / 2);
            }
        }

        // Draw wave
        context.beginPath();

        for (i = 0; i < points.length; i += 2) {
            if (i === 0) {
                context.moveTo(points[i], points[i+1]);
            }
            else {
                context.lineTo(points[i], points[i+1]);
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
    scrollSpeed: 0.15,
    smoothing: 0,
    smoothRatio: 0.1
};

module.exports = CanvasWave;
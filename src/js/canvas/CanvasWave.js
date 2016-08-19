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
    }

    render(points) {
        let canvas = this.canvas,
            context = this.context,
            { width, height, color, lineWidth } = this.options;

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

        for (let i = 0; i < points.length; i += 2) {
            if (i === 0) {
                context.moveTo(points[i], points[i+1] * height);
            }
            else {
                context.lineTo(points[i], points[i+1] * height);
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
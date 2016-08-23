'use strict';

const Component = require('../core/Component.js');
const BezierSpline = require('../drawing/BezierSpline.js');

class CanvasWave extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, CanvasWave.defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;

        this.context = this.canvas.getContext('2d');
    }

    render(points) {
        let i,
            canvas = this.canvas,
            context = this.context,
            { width, height, color, lineWidth, distance, smooth } = this.options;

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
        if (smooth && distance > 1) {
            for (i = 0; i < points.length; i += 2) {
                points[i+1] = points[i+1] * height;
            }
            BezierSpline.draw(context, points);
        }
        else {
            context.beginPath();

            for (i = 0; i < points.length; i += 2) {
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
}

CanvasWave.defaults = {
    color: '#FFFFFF',
    width: 400,
    height: 200,
    lineWidth: 1.0,
    distance: 0,
    smooth: false
};

module.exports = CanvasWave;
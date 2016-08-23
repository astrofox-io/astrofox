'use strict';

const Component = require('../core/Component');
const BezierSpline = require('../drawing/BezierSpline');
const { setColor } = require('../util/canvas');

class CanvasWave extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, CanvasWave.defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;

        this.context = this.canvas.getContext('2d');
    }

    render(points, smooth) {
        let i,
            canvas = this.canvas,
            context = this.context,
            { width, height, color, lineWidth, fillColor } = this.options;

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
        if (smooth) {
            for (i = 0; i < points.length; i += 2) {
                points[i+1] = height - (points[i+1] * height);
            }

            context.beginPath();

            // Draw spline
            BezierSpline.drawPath(context, points);

            if (fillColor) {
                setColor(context, fillColor, 0, 0, 0, height);

                // Close loop
                context.moveTo(width, points[points.length - 1]);
                context.lineTo(width, height);
                context.lineTo(0, height);
                context.lineTo(0, points[1]);

                context.fill();
            }

            context.stroke();
        }
        else {
            context.beginPath();

            for (i = 0; i < points.length; i += 2) {
                if (i === 0) {
                    context.moveTo(points[i], height - (points[i+1] * height));
                }
                else {
                    context.lineTo(points[i], height - (points[i+1] * height));
                }
            }

            if (fillColor) {
                context.closePath();
                context.fill();
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
    fillColor: null
};

module.exports = CanvasWave;
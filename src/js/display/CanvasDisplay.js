'use strict';

const Display = require('../display/Display.js');
const { deg2rad } = require('../util/math.js');

class CanvasDisplay extends Display {
    constructor(name, options) {
        super(name, options);

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    renderToCanvas(context) {
        var x, y,
            canvas = this.canvas,
            options = this.options,
            halfWidth = canvas.width / 2,
            halfHeight = canvas.height / 2,
            halfSceneWidth = context.canvas.width / 2,
            halfSceneHeight = context.canvas.height / 2;

        if (options.rotation % 360 !== 0) {
            x = halfSceneWidth + options.x;
            y = halfSceneHeight - options.y;

            context.save();
            context.translate(x, y);
            context.rotate(deg2rad(options.rotation));
            context.drawImage(canvas, -halfWidth, -halfHeight);
            context.restore();
        }
        else {
            x = halfSceneWidth - halfWidth + options.x;
            y = halfSceneHeight - halfHeight - options.y;

            context.drawImage(canvas, x, y);
        }
    }
}

module.exports = CanvasDisplay;
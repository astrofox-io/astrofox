'use strict';

const Display = require('../display/Display.js');
const { deg2rad } = require('../util/math.js');

class CanvasDisplay extends Display {
    constructor(name, options) {
        super(name, options);

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    renderToScene(context) {
        this.renderToCanvas(
            context,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    renderToCanvas(context, dx, dy) {
        var x, y,
            canvas = this.canvas,
            options = this.options,
            halfSceneWidth = context.canvas.width / 2,
            halfSceneHeight = context.canvas.height / 2;

        if (options.rotation % 360 !== 0) {
            x = halfSceneWidth + options.x;
            y = halfSceneHeight - options.y;

            context.save();
            context.translate(x, y);
            context.rotate(deg2rad(options.rotation));
            context.drawImage(canvas, -dx, -dy);
            context.restore();
        }
        else {
            x = halfSceneWidth - dx + options.x;
            y = halfSceneHeight - dy - options.y;

            context.drawImage(canvas, x, y);
        }
    }
}

module.exports = CanvasDisplay;
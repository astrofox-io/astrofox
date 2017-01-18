import Display from './Display';
import { deg2rad } from '../util/math';

export default class CanvasDisplay extends Display {
    constructor(type, options) {
        super(type, options);

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    renderToScene(scene) {
        this.renderToCanvas(
            scene.getContext('2d'),
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    renderToCanvas(context, dx, dy) {
        let x, y,
            canvas = this.canvas,
            options = this.options,
            halfSceneWidth = context.canvas.width / 2,
            halfSceneHeight = context.canvas.height / 2;

        context.globalAlpha = options.opacity;

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

        context.globalAlpha = 1.0;
    }
}
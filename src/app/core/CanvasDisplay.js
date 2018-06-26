import Display from 'core/Display';
import { deg2rad } from 'utils/math';

export default class CanvasDisplay extends Display {
    constructor(type, options) {
        super(type, options);

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    renderToScene(scene) {
        const { width, height } = this.canvas;

        this.renderToCanvas(
            scene.getContext('2d'),
            width / 2,
            height / 2,
        );
    }

    renderToCanvas(context, dx, dy) {
        const { canvas } = this;
        const { width, height } = context.canvas;

        const {
            x,
            y,
            opacity,
            rotation,
        } = this.options;

        const halfSceneWidth = width / 2;
        const halfSceneHeight = height / 2;

        context.globalAlpha = opacity;

        if (rotation % 360 !== 0) {
            const cx = halfSceneWidth + x;
            const cy = halfSceneHeight - y;

            context.save();
            context.translate(cx, cy);
            context.rotate(deg2rad(rotation));
            context.drawImage(canvas, -dx, -dy);
            context.restore();
        }
        else {
            const cx = halfSceneWidth - (dx - x);
            const cy = halfSceneHeight - (dy + y);

            context.drawImage(canvas, cx, cy);
        }

        context.globalAlpha = 1.0;
    }
}

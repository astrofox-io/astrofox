import CanvasDisplay from './CanvasDisplay';
import CanvasImage from '../canvas/CanvasImage';
import WATERMARK from '../../images/data/watermark';

const WATERMARK_HEIGHT = 96,
    WATERMARK_WIDTH = 96;

export default class WatermarkDisplay extends CanvasDisplay {
    constructor(options) {
        super(WatermarkDisplay, options);

        this.image = new CanvasImage(this.options, this.canvas);
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            if (this.image.update(options)) {
                let render = false;

                Object.keys(CanvasImage.defaults).forEach(prop => {
                    if (options[prop] !== undefined) {
                        render = true;
                    }
                });

                if (render) {
                    this.image.render();
                }
            }
        }

        return changed;
    }

    setSize(width, height) {
        this.update({
            x: 0,
            y: -height/2 + 10 + (WATERMARK_HEIGHT * 0.5)
        });
    }
}

WatermarkDisplay.label = 'Watermark';

WatermarkDisplay.className = 'WatermarkDisplay';

WatermarkDisplay.defaults = {
    src: WATERMARK,
    x: 0,
    y: 0,
    width: WATERMARK_WIDTH,
    height: WATERMARK_HEIGHT,
    fixed: true,
    rotation: 0,
    opacity: 0.5,
    enabled: false
};
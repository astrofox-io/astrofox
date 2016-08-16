'use strict';

const CanvasDisplay = require('./CanvasDisplay.js');
const CanvasImage = require('../canvas/CanvasImage.js');

const MIN_RESIZE_WIDTH = 100;
const MIN_RESIZE_HEIGHT = 100;

class ImageDisplay extends CanvasDisplay {
    constructor(options) {
        super(ImageDisplay, options);

        this.image = new CanvasImage(this.options, this.canvas);
    }
    
    update(options) {
        let changed = super.update(options);

        if (changed) {
            if (this.image.update(options)) {
                if (options.src !== undefined ||
                    options.width !== undefined ||
                    options.height !== undefined) {
                    this.image.render();
                }
            }
        }

        return changed;
    }
}

ImageDisplay.label = 'Image';

ImageDisplay.className = 'ImageDisplay';

ImageDisplay.defaults = {
    src: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fixed: true,
    rotation: 0,
    opacity: 1.0
};

module.exports = ImageDisplay;

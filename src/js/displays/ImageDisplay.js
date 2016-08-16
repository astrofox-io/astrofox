'use strict';

const CanvasDisplay = require('./CanvasDisplay.js');
const CanvasImage = require('../canvas/CanvasImage.js');

class ImageDisplay extends CanvasDisplay {
    constructor(options) {
        super(ImageDisplay, options);

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

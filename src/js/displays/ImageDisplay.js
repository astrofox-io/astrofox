'use strict';

const CanvasDisplay = require('./CanvasDisplay.js');

const MIN_RESIZE_WIDTH = 100;
const MIN_RESIZE_HEIGHT = 100;

class ImageDisplay extends CanvasDisplay {
    constructor(options) {
        super(ImageDisplay, options);

        this.image = new Image();
        this.image.onload = () => {
            this.imageLoaded = true;
            this.render();
        };

        this.imageLoaded = false;
    }
    
    update(options) {
        let changed = super.update(options);

        if (this.image.src !== this.options.src) {
            this.image.src = this.options.src;
        }

        return changed;
    }

    render() {
        if (!this.imageLoaded) return;

        let i, w, h, y_src, y_dest, width, height, last_w, last_h,
            canvas = this.canvas,
            context = this.context,
            options = this.options,
            img = this.image;

        // Reset canvas
        canvas.width = options.width;
        canvas.height = options.height;

        // Get original dimensions
        width = img.naturalWidth;
        height = img.naturalHeight;

        // Set opacity
        context.globalAlpha = options.opacity;

        // Resize smaller
        if (options.width < width && options.height < height) {
            let buffer = document.createElement('canvas'),
                bufferContext = buffer.getContext('2d');

            // Double sized canvas for two drawing regions
            buffer.width = width;
            buffer.height = height * 2;

            // Draw image at original size
            bufferContext.drawImage(img, 0, 0, width, height);

            i = 0;
            y_src = 0;
            last_w = width;
            last_h = height;

            while (last_w > MIN_RESIZE_WIDTH && last_h > MIN_RESIZE_HEIGHT && last_w > options.width && last_h > options.height) {
                y_src = (i % 2) ? height : 0;
                y_dest = (i % 2) ? 0 : height;
                w = ~~(width / (2 * (i + 1)));
                h = ~~(height / (2 * (i + 1)));

                if (w <= options.width || h <= options.height) break;

                // Clear the drawing region
                bufferContext.clearRect(0, y_dest, w, h);

                // Draw into buffer region
                bufferContext.drawImage(buffer, 0, y_src, last_w, last_h, 0, y_dest, w, h);

                last_w = w;
                last_h = h;
                i++;
            }

            context.drawImage(buffer, 0, (i % 2) ? height : 0, last_w, last_h, 0, 0, options.width, options.height);
        }
        // Draw normally
        else {
            context.drawImage(img, 0, 0, options.width, options.height);
        }
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

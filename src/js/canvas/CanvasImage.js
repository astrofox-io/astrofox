'use strict';

const Component = require('../core/Component.js');

const MIN_RESIZE_WIDTH = 100;
const MIN_RESIZE_HEIGHT = 100;

const defaults = {
    src: '',
    width: 0,
    height: 0
};

class CanvasImage extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;

        this.context = this.canvas.getContext('2d');

        this.buffer = document.createElement('canvas');
        this.bufferContext = this.buffer.getContext('2d');

        this.image = new Image();
        this.image.onload = () => {
            this.imageLoaded = true;
            this.render();
        };
        this.image.src = this.options.src;

        this.imageLoaded = false;
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            if (this.image.src !== this.options.src) {
                this.image.src = this.options.src;
            }
        }

        return changed;
    }

    render() {
        if (!this.imageLoaded) return;

        let i, w, h, y_src, y_dest, naturalWidth, naturalHeight, last_w, last_h,
            canvas = this.canvas,
            context = this.context,
            image = this.image,
            buffer = this.buffer,
            bufferContext = this.bufferContext,
            { width, height} = this.options;

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = buffer.width = width;
            canvas.height = buffer.height = height;
        }

        // Get original dimensions
        naturalWidth = image.naturalWidth;
        naturalHeight = image.naturalHeight;

        // Resize smaller
        if (width < naturalWidth && height < naturalHeight) {
            // Double sized canvas for two drawing regions
            buffer.width = naturalWidth;
            buffer.height = naturalHeight * 2;

            // Draw image at original size
            bufferContext.drawImage(image, 0, 0, naturalWidth, naturalHeight);

            i = 0;
            y_src = 0;
            last_w = naturalWidth;
            last_h = naturalHeight;

            while (last_w > MIN_RESIZE_WIDTH && last_h > MIN_RESIZE_HEIGHT && last_w > width && last_h > height) {
                y_src = (i % 2) ? naturalHeight : 0;
                y_dest = (i % 2) ? 0 : naturalHeight;
                w = ~~(naturalWidth / (2 * (i + 1)));
                h = ~~(naturalHeight / (2 * (i + 1)));

                if (w <= width || h <= height) break;

                // Clear the drawing region
                bufferContext.clearRect(0, y_dest, w, h);

                // Draw into buffer region
                bufferContext.drawImage(buffer, 0, y_src, last_w, last_h, 0, y_dest, w, h);

                last_w = w;
                last_h = h;
                i++;
            }

            context.drawImage(buffer, 0, (i % 2) ? naturalHeight : 0, last_w, last_h, 0, 0, width, height);
        }
        // Draw normally
        else {
            context.drawImage(image, 0, 0, width, height);
        }
    }
}

module.exports = CanvasImage;

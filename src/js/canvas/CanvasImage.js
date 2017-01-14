/* eslint-disable react/require-render-return */
'use strict';

const Component = require('../core/Component');

const MIN_RESIZE_WIDTH = 100;

class CanvasImage extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, CanvasImage.defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;

        this.context = this.canvas.getContext('2d');

        this.image = new Image();
        this.image.onload = () => {
            this.generateMipMaps();
            this.render();
        };
        this.image.src = this.options.src;
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

    generateMipMaps() {
        let image = this.image,
            src = image,
            width = image.naturalWidth / 2,
            height = image.naturalHeight / 2,
            steps = this.getResizeSteps(image.naturalWidth, MIN_RESIZE_WIDTH),
            mipmaps = [];

        for (let i = 0; i < steps; i++) {
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            canvas.getContext('2d').drawImage(src, 0, 0, width, height);

            mipmaps.push(canvas);

            src = mipmaps[i];
            width = width / 2;
            height = height / 2;
        }

        this.mipmaps = mipmaps;
    }

    getResizeSteps(sourceWidth, targetWidth) {
        return Math.ceil(Math.log(sourceWidth / targetWidth) / Math.log(2));
    }

    render() {
        let canvas = this.canvas,
            context = this.context,
            image = this.image,
            { width, height} = this.options;

        if (!image.src) return;

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
        else {
            context.clearRect(0, 0, width, height);
        }

        // Resize smaller
        if (width < image.naturalWidth && height < image.naturalHeight) {
            let src = image;

            this.mipmaps.forEach(map => {
                if (width < map.width) {
                    src = map;
                }
            });

            context.drawImage(src, 0, 0, width, height);
        }
        // Draw normally
        else {
            context.drawImage(image, 0, 0, width, height);
        }
    }
}

CanvasImage.defaults = {
    src: '',
    width: 0,
    height: 0
};

module.exports = CanvasImage;

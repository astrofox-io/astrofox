/* eslint-disable react/require-render-return */
import Component from 'core/Component';

const MIN_RESIZE_WIDTH = 100;

export default class CanvasImage extends Component {
    static defaultOptions = {
        src: '',
        width: 1,
        height: 1,
    }

    constructor(options, canvas) {
        super({ ...CanvasImage.defaultOptions, ...options });

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width || 1;
        this.canvas.height = this.options.height || 1;

        this.context = this.canvas.getContext('2d');

        this.image = new Image();
        this.image.onload = () => {
            this.generateMipMaps();
            this.render();
        };
        this.image.src = this.options.src;
    }

    getResizeSteps(sourceWidth, targetWidth) {
        return Math.ceil(Math.log(sourceWidth / targetWidth) / Math.log(2));
    }

    generateMipMaps() {
        const { image } = this;
        const steps = this.getResizeSteps(image.naturalWidth, MIN_RESIZE_WIDTH);
        const mipmaps = [];
        let src = image;
        let width = image.naturalWidth / 2;
        let height = image.naturalHeight / 2;

        for (let i = 0; i < steps; i += 1) {
            const canvas = document.createElement('canvas');
            canvas.width = width || 1;
            canvas.height = height || 1;

            canvas.getContext('2d').drawImage(src, 0, 0, width, height);

            mipmaps.push(canvas);

            src = mipmaps[i];
            width /= 2;
            height /= 2;
        }

        this.mipmaps = mipmaps;
    }

    update(options) {
        const changed = super.update(options);

        if (changed) {
            if (this.image.src !== this.options.src) {
                this.image.src = this.options.src;
            }
        }

        return changed;
    }

    render() {
        const {
            canvas,
            context,
            image,
        } = this;

        const {
            width,
            height,
        } = this.options;

        if (!image.src) return;

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width || 1;
            canvas.height = height || 1;
        }
        else {
            context.clearRect(0, 0, width, height);
        }

        // Resize smaller
        if (width < image.naturalWidth && height < image.naturalHeight) {
            let src = image;

            this.mipmaps.forEach((map) => {
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

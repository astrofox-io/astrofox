/* eslint-disable react/require-render-return */
import Component from 'core/Component';
import { setColor } from 'utils/canvas';

export default class CanvasBars extends Component {
    static defaultOptions = {
        width: 100,
        height: 50,
        color: '#FFFFFF',
        origin: 'left',
    }

    constructor(options, canvas) {
        super({ ...CanvasBars.defaultOptions, ...options });

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;

        this.context = this.canvas.getContext('2d');
    }

    render(value) {
        const {
            canvas,
            context,
        } = this;

        const {
            height, width, color, origin,
        } = this.options;

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
        else {
            context.clearRect(0, 0, width, height);
        }

        // Canvas setup
        setColor(context, color, 0, 0, 0, height);

        switch (origin) {
            case 'left':
                context.fillRect(0, 0, value * width, height);
                break;
            case 'bottom':
                context.fillRect(0, height, width, -value * height);
                break;
            case 'right':
                context.fillRect(width, 0, -value * width, height);
                break;
            case 'top':
                context.fillRect(0, 0, width, -value * height);
                break;
        }
    }
}

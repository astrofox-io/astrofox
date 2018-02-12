import CanvasDisplay from 'core/CanvasDisplay';
import CanvasText from 'canvas/CanvasText';

export default class TextDisplay extends CanvasDisplay {
    static label = 'Text';

    static className = 'TextDisplay';

    static defaults = {
        text: '',
        size: 40,
        font: 'Roboto',
        italic: false,
        bold: false,
        x: 0,
        y: 0,
        color: '#FFFFFF',
        rotation: 0,
        opacity: 1.0,
    }

    constructor(options) {
        super(TextDisplay, options);

        this.text = new CanvasText(this.options, this.canvas);
    }

    update(options) {
        const changed = super.update(options);

        if (changed) {
            if (this.text.update(options)) {
                let render = false;

                Object.keys(CanvasText.defaults).forEach((prop) => {
                    if (options[prop] !== undefined) {
                        render = true;
                    }
                });

                if (render) {
                    this.text.render();
                }
            }
        }

        return changed;
    }
}


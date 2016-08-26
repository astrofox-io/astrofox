'use strict';

const CanvasDisplay = require('./CanvasDisplay');
const CanvasText = require('../canvas/CanvasText');

class TextDisplay extends CanvasDisplay {
    constructor(options) {
        super(TextDisplay, options);

        this.text = new CanvasText(this.options, this.canvas);
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            if (this.text.update(options)) {
                let render = false;

                Object.keys(CanvasText.defaults).forEach(prop => {
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

TextDisplay.label = 'Text';

TextDisplay.className = 'TextDisplay';

TextDisplay.defaults = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    x: 0,
    y: 0,
    color: '#FFFFFF',
    rotation: 0,
    opacity: 1.0
};

module.exports = TextDisplay;

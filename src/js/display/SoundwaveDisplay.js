'use strict';

const CanvasDisplay = require('../display/CanvasDisplay.js');
const WaveDisplay = require('../display/WaveDisplay.js');

class SoundwaveDisplay extends CanvasDisplay {
    constructor(options) {
        super(SoundwaveDisplay.className, Object.assign({}, SoundwaveDisplay.defaults, options));

        this.wave = new WaveDisplay(this.canvas, this.options);

        this.initialized = !!options;
    }

    update(options) {
        this.wave.update(options);

        return super.update(options);
    }

    renderToScene(context, data) {
        this.wave.render(data.td, data.playing);

        this.renderToCanvas(
            context,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }
}

SoundwaveDisplay.label = 'Soundwave';

SoundwaveDisplay.className = 'SoundwaveDisplay';

SoundwaveDisplay.defaults = {
    color: '#FFFFFF',
    height: 240,
    width: 854,
    x: 0,
    y: 0,
    lineWidth: 1.0,
    rotation: 0,
    opacity: 1.0
};

module.exports = SoundwaveDisplay;
'use strict';

const CanvasDisplay = require('../display/CanvasDisplay.js');
const WaveDisplay = require('../display/WaveDisplay.js');

const defaults = {
    color: '#ffffff',
    height: 240,
    width: 854,
    x: 0,
    y: 0,
    lineWidth: 1.0,
    rotation: 0,
    opacity: 1.0
};

class SoundwaveDisplay extends CanvasDisplay {
    constructor(options) {
        super('SoundwaveDisplay', defaults);

        this.wave = new WaveDisplay(this.canvas, options);

        this.update(options);
    }

    update(options) {
        this.wave.update(options);

        return super.update(options);
    }

    renderToCanvas(scene, data) {
        this.wave.render(data.td, data.playing);

        CanvasDisplay.prototype.renderToCanvas.call(this, scene);
    }
}

SoundwaveDisplay.info = {
    name: 'Soundwave'
};

module.exports = SoundwaveDisplay;
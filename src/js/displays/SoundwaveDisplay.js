'use strict';

const CanvasDisplay = require('./CanvasDisplay.js');
const CanvasWave = require('../canvas/CanvasWave.js');

class SoundwaveDisplay extends CanvasDisplay {
    constructor(options) {
        super(SoundwaveDisplay, options);

        this.wave = new CanvasWave(this.options, this.canvas);
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            this.wave.update(options);
        }

        return changed;
    }

    renderToScene(scene, data) {
        this.wave.render(data.td, data.playing);

        this.renderToCanvas(
            scene.getContext('2d'),
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
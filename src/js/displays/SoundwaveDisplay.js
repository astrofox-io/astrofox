'use strict';

const CanvasDisplay = require('./CanvasDisplay');
const CanvasWave = require('../canvas/CanvasWave');
const WaveParser = require('../audio/WaveParser');

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
        let canvas = this.canvas,
            { smooth, length } = this.options,
            points = WaveParser.parseTimeData(data.td, canvas.width, length);

        this.wave.render(points, (length > 3) ? smooth : false);

        this.renderToCanvas(
            scene.getContext('2d'),
            canvas.width / 2,
            canvas.height / 2
        );
    }
}

SoundwaveDisplay.label = 'Soundwave';

SoundwaveDisplay.className = 'SoundwaveDisplay';

SoundwaveDisplay.defaults = {
    color: '#FFFFFF',
    width: 854,
    height: 240,
    lineWidth: 1.0,
    length: 0,
    smooth: false,
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1.0
};

module.exports = SoundwaveDisplay;
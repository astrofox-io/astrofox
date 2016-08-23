'use strict';

const CanvasDisplay = require('./CanvasDisplay.js');
const CanvasBars = require('../canvas/CanvasBars.js');
const SpectrumParser = require('../audio/SpectrumParser.js');

class BarSpectrumDisplay extends CanvasDisplay { 
    constructor(options) {
        super(BarSpectrumDisplay, options);

        this.bars = new CanvasBars(this.options, this.canvas);
        this.parser = new SpectrumParser(this.options);
    }
    
    update(options) {
        let changed = super.update(options);

        if (changed) {
            this.bars.update(options);
            this.parser.update(options);
        }

        return changed;
    }

    renderToScene(scene, data) {
        let fft = this.parser.parseFFT(data.fft);

        this.bars.render(fft);

        this.renderToCanvas(
            scene.getContext('2d'),
            this.canvas.width / 2,
            this.options.height
        );
    }
}

BarSpectrumDisplay.label = 'Bar Spectrum';

BarSpectrumDisplay.className = 'BarSpectrumDisplay';

BarSpectrumDisplay.defaults = {
    width: 770,
    height: 240,
    x: 0,
    y: 0,
    barWidth: -1,
    barSpacing: -1,
    barWidthAutoSize: 1,
    barSpacingAutoSize: 1,
    shadowHeight: 100,
    color: ['#FFFFFF', '#FFFFFF'],
    shadowColor: ['#333333', '#000000'],
    rotation: 0,
    opacity: 1.0,
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -12,
    minFrequency: 0,
    maxFrequency: 6000,
    fftSize: 1024,
    sampleRate: 44100,
    normalize: true
};

module.exports = BarSpectrumDisplay;
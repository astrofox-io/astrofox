'use strict';

const BarDisplay = require('../display/BarDisplay.js');
const Display = require('../display/Display.js');
const CanvasDisplay = require('../display/CanvasDisplay.js');
const SpectrumParser = require('../audio/SpectrumParser.js');

class BarSpectrumDisplay extends CanvasDisplay { 
    constructor(options) {
        super(BarSpectrumDisplay.className, Object.assign({}, BarSpectrumDisplay.defaults, options));
    
        this.bars = new BarDisplay(this.canvas, this.options);
        this.parser = new SpectrumParser(this.options);

        this.initialized = !!options;
    }
    
    update(options) {
        let changed = super.update(options);

        if (changed) {
            this.bars.update(options);
            this.parser.update(options);
        }

        return changed;
    }

    renderToScene(context, data) {
        let fft = this.parser.parseFFT(data.fft);
        this.bars.render(fft);

        this.renderToCanvas(
            context,
            this.canvas.width / 2,
            this.bars.options.height
        );
    }
}

BarSpectrumDisplay.label = 'Bar Spectrum';

BarSpectrumDisplay.className = 'BarSpectrumDisplay';

BarSpectrumDisplay.defaults = {
    height: 240,
    width: 770,
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
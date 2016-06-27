'use strict';

const BarDisplay = require('../display/BarDisplay.js');
const Display = require('../display/Display.js');
const CanvasDisplay = require('../display/CanvasDisplay.js');
const SpectrumParser = require('../audio/SpectrumParser.js');

const defaults = {
    height: 300,
    width: 200,
    x: 0,
    y: 0,
    barWidth: -1,
    barSpacing: -1,
    barWidthAutoSize: 1,
    barSpacingAutoSize: 1,
    shadowHeight: 100,
    color: '#ffffff',
    shadowColor: '#cccccc',
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

const RADIANS = 0.017453292519943295;

class BarSpectrumDisplay extends CanvasDisplay { 
    constructor(options) {
        super('BarSpectrumDisplay', Object.assign({}, defaults, options));
    
        this.bars = new BarDisplay(this.canvas, this.options);
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

    renderToCanvas(context, data) {
        let fft = this.parser.parseFFT(data.fft);
        this.bars.render(fft);

        var x, y,
            canvas = this.canvas,
            options = this.options,
            barOptions = this.bars.options,
            halfWidth = canvas.width / 2,
            halfHeight = barOptions.height,
            halfSceneWidth = context.canvas.width / 2,
            halfSceneHeight = context.canvas.height / 2;


        if (options.rotation % 360 !== 0) {
            x = halfSceneWidth + options.x;
            y = halfSceneHeight - options.y;

            context.save();
            context.translate(x, y);
            context.rotate(options.rotation * RADIANS);
            context.drawImage(canvas, -halfWidth, -halfHeight);
            context.restore();
        }
        else {
            x = halfSceneWidth - halfWidth + options.x;
            y = halfSceneHeight - halfHeight - options.y;

            context.drawImage(canvas, x, y);
        }
    }
}

BarSpectrumDisplay.info = {
    name: 'Bar Spectrum'
};

module.exports = BarSpectrumDisplay;
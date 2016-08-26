'use strict';

const CanvasDisplay = require('./CanvasDisplay');
const CanvasWave = require('../canvas/CanvasWave');
const SpectrumParser = require('../audio/SpectrumParser');

class WaveSpectrumDisplay extends CanvasDisplay {
    constructor(options) {
        super(WaveSpectrumDisplay, options);

        this.wave = new CanvasWave(this.options, this.canvas);
        this.parser = new SpectrumParser(this.options);
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            this.wave.update(options);
            this.parser.update(options);
        }

        return changed;
    }

    getPoints(fft) {
        let i, j, k,
            { width } = this.options,
            points = [];

        for (i = 0, j = 0, k = 0; i < fft.length; i++) {
            j = fft[i];

            if (i === 0 || i == fft.length - 1 || k !== (j > fft[i-1]) ? 1 : -1) {
                points.push(i * (width / fft.length));
                points.push(j);
            }

            k = (j > fft[i-1]) ? 1 : -1;
        }

        points[points.length - 2] = width;

        return points;
    }

    renderToScene(scene, data) {
        let fft = this.parser.parseFFT(data.fft);

        this.wave.render(this.getPoints(fft), true);

        this.renderToCanvas(
            scene.getContext('2d'),
            this.canvas.width / 2,
            this.canvas.height
        );
    }
}

WaveSpectrumDisplay.label = 'Wave Spectrum';

WaveSpectrumDisplay.className = 'WaveSpectrumDisplay';

WaveSpectrumDisplay.defaults = {
    width: 770,
    height: 240,
    x: 0,
    y: 0,
    smooth: true,
    distance: 10,
    closePath: true,
    stroke: true,
    color: '#FFFFFF',
    fill: true,
    fillColor: ['#8800FF','#8888FF'],
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

module.exports = WaveSpectrumDisplay;
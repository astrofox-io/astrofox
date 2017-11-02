import Component from 'core/Component';
import SpectrumParser from 'audio/SpectrumParser';
import { fftSize, sampleRate } from 'config/system.json';
import { val2pct } from 'util/math';

export default class AudioReactor extends Component {
    constructor(options) {
        super(Object.assign({}, AudioReactor.defaults, options));

        this.spectrum = new SpectrumParser({
            fftSize: fftSize,
            sampleRate: sampleRate,
            smoothingTimeConstant: 0.5,
            minDecibels: -100,
            maxDecibels: -12,
            minFrequency: 0,
            maxFrequency: Math.ceil(sampleRate/fftSize * AudioReactor.maxBins),
            normalize: true,
            bins: AudioReactor.maxBins
        });

        this.result = { fft: null, output: 0 };
    }

    update(options) {
        const changed = super.update(options);

        if (changed) {
            this.spectrum.update(options);
        }

        return changed;
    }

    parse(data) {
        let fft = this.spectrum.parseFFT(data.fft),
            output = 0;

        const { x1, y1, x2, y2 } = this.options.selection,
            start = ~~(x1 * fft.length),
            end = ~~(x2 * fft.length);

        for (let i = start; i < end; i++) {
            output += val2pct(fft[i], 1 - y2, 1 - y1);
        }

        this.result.fft = fft;
        this.result.output = output / (end - start);

        return this.result;
    }

    getResult() {
        return this.result;
    }

    toJSON() {
        return this.options;
    }
}

AudioReactor.maxBins = 64;

AudioReactor.frequencyRange = AudioReactor.maxBins * sampleRate / fftSize;

AudioReactor.defaults = {
    outputMode: 'Average',
    selection: { x1: 0, x2: 1, y1: 0, y2: 1 }
};

AudioReactor.parserDefaults = {
    fftSize: fftSize,
    sampleRate: sampleRate,
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -12,
    minFrequency: 0,
    maxFrequency: Math.ceil(sampleRate/fftSize * AudioReactor.maxBins),
    normalize: true,
    bins: AudioReactor.maxBins
};

AudioReactor.outputModes = [
    'Average',
    'Max',
    'Min',
    'Forward',
    'Reverse'
];
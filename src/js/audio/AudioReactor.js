import Component from 'core/Component';
import SpectrumParser from 'audio/SpectrumParser';
import { fftSize, sampleRate } from 'config/system.json';

export default class AudioReactor extends Component {
    constructor(options) {
        super(options);

        this.spectrum = new SpectrumParser(Object.assign({}, AudioReactor.parserDefaults));

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
        let fft = this.spectrum.parseFFT(data),
            { start, end } = this.options.frequencySelection,
            output = 0;

        for (let i = start; i < end; i++) {
            output += fft[i];
        }

        this.result.fft = fft;
        this.result.output = output / (end - start);

        return this.result;
    }
}

AudioReactor.maxBins = 64;

AudioReactor.frequencyRange = AudioReactor.maxBins * sampleRate / fftSize;

AudioReactor.defaults = {
    outputMode: 'Average',
    frequencySelection: { start: 0, end: AudioReactor.maxBins }
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
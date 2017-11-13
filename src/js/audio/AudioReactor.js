import Component from 'core/Component';
import SpectrumParser from 'audio/SpectrumParser';
import { val2pct, floor, ceil } from 'util/math';
import { fftSize, sampleRate } from 'config/system.json';

const REACTOR_BINS = 64;

export default class AudioReactor extends Component {
    constructor(options) {
        super(Object.assign({}, AudioReactor.defaults, options));

        this.parser = new SpectrumParser({
            maxDecibels: -20,
            maxFrequency: ceil(sampleRate/fftSize * REACTOR_BINS),
            normalize: true,
            bins: REACTOR_BINS
        });

        this.result = { fft: null, output: 0 };
    }

    parse(data) {
        let fft = this.parser.parseFFT(data.fft),
            output = 0;

        const { x1, y1, x2, y2 } = this.options.range,
            start = floor(x1 * fft.length),
            end = ceil(x2 * fft.length);

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

AudioReactor.defaults = {
    outputMode: 'Average',
    lastValue: 0,
    min: 0,
    max: 1,
    selection: { x: 0, y: 0, width: 100, height: 100 },
    range: { x1: 0, x2: 1, y1: 0, y2: 1 }
};

AudioReactor.outputModes = [
    'Average',
    'Max',
    'Min',
    'Forward',
    'Reverse'
];
import Component from 'core/Component';
import SpectrumParser from 'audio/SpectrumParser';
import { val2pct, floor, ceil } from 'utils/math';
import { fftSize, sampleRate } from 'config/system.json';

const REACTOR_BINS = 64;
const CYCLE_MODIFIER = 0.05;

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
        this.direction = 1;
    }

    parse(data) {
        let fft = this.parser.parseFFT(data.fft),
            { output } = this.result,
            sum = 0;

        const { x1, y1, x2, y2 } = this.options.range,
            { outputMode } = this.options,
            start = floor(x1 * fft.length),
            end = ceil(x2 * fft.length);

        for (let i = start; i < end; i++) {
            sum += val2pct(fft[i], 1 - y2, 1 - y1);
        }

        switch (outputMode) {
            case 'Forward':
                output = sum / (end - start);
                break;

            case 'Backwards':
                output = 1 - (sum / (end - start));
                break;

            case 'Cycle Forward':
                if (data.playing) {
                    output = (output + (sum * CYCLE_MODIFIER)) % 1;
                }
                break;

            case 'Cycle Backwards':
                if (data.playing) {
                    output -= (sum * CYCLE_MODIFIER);
                    if (output < 0) {
                        output = 1 - output;
                    }
                }
                break;

            case 'Cycle':
                if (data.playing) {
                    output += sum * CYCLE_MODIFIER * this.direction;
                    if (output > 1) {
                        output = 1 - (output % 1);
                        this.direction = -1;
                    }
                    else if (output < 0) {
                        output = output % 1;
                        this.direction = 1;
                    }
                }
        }

        this.result.fft = fft;
        this.result.output = output;

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
    outputMode: 'Forward',
    lastValue: 0,
    min: 0,
    max: 1,
    selection: { x: 0, y: 0, width: 100, height: 100 },
    range: { x1: 0, x2: 1, y1: 0, y2: 1 }
};
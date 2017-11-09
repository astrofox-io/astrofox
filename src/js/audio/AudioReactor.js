import Component from 'core/Component';
import { val2pct, floor, ceil } from 'util/math';

export default class AudioReactor extends Component {
    constructor(options) {
        super(Object.assign({}, AudioReactor.defaults, options));

        this.result = { fft: null, output: 0 };
    }

    parse(data) {
        let fft = data.reactor,
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
import Component from 'core/Component';
import SpectrumParser from 'audio/SpectrumParser';
import { val2pct, floor, ceil } from 'utils/math';
import { FFT_SIZE, SAMPLE_RATE } from 'view/constants';

const REACTOR_BINS = 64;
const CYCLE_MODIFIER = 0.05;

let reactorCount = 0;

export function resetReactorCount() {
  reactorCount = 0;
}

export default class AudioReactor extends Component {
  static defaultProperties = {
    enabled: true,
    outputMode: 'Add',
    lastValue: 0,
    min: 0,
    max: 1,
    selection: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
    range: {
      x1: 0,
      x2: 1,
      y1: 0,
      y2: 1,
    },
  };

  constructor(properties) {
    reactorCount += 1;
    super({
      displayName: `Reactor ${reactorCount}`,
      ...AudioReactor.defaultProperties,
      ...properties,
    });

    Object.defineProperty(this, 'name', { value: 'AudioReactor' });

    this.parser = new SpectrumParser({
      maxDecibels: -20,
      maxFrequency: ceil((SAMPLE_RATE / FFT_SIZE) * REACTOR_BINS),
      normalize: true,
      bins: REACTOR_BINS,
    });

    this.result = { fft: null, output: 0 };
    this.direction = 1;
  }

  getResult() {
    return this.result;
  }

  parse(data) {
    const fft = this.parser.parseFFT(data.fft);
    const {
      outputMode,
      range: { x1, y1, x2, y2 },
    } = this.properties;
    const start = floor(x1 * fft.length);
    const end = ceil(x2 * fft.length);

    let { output } = this.result;
    let sum = 0;

    for (let i = start; i < end; i += 1) {
      sum += val2pct(fft[i], 1 - y2, 1 - y1);
    }

    switch (outputMode) {
      case 'Add':
        output = sum / (end - start);
        break;

      case 'Subtract':
        output = 1 - sum / (end - start);
        break;

      case 'Forward':
        if (data.playing) {
          output = (output + sum * CYCLE_MODIFIER) % 1;
        }
        break;

      case 'Reverse':
        if (data.playing) {
          output -= sum * CYCLE_MODIFIER;
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
          } else if (output < 0) {
            output %= 1;
            this.direction = 1;
          }
        }
        break;
    }

    this.result.fft = fft;
    this.result.output = output;

    return this.result;
  }

  toJSON() {
    const { id, name, properties } = this;

    return {
      id,
      name,
      properties: { ...properties },
    };
  }
}

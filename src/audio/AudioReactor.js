import Entity from 'core/Entity';
import SpectrumParser from 'audio/SpectrumParser';
import { val2pct, floor, ceil } from 'utils/math';
import {
  FFT_SIZE,
  SAMPLE_RATE,
  REACTOR_BARS,
  REACTOR_BAR_WIDTH,
  REACTOR_BAR_HEIGHT,
  REACTOR_BAR_SPACING,
} from 'view/constants';
import { contains } from '../utils/array';

const REACTOR_BINS = 64;
const CYCLE_MODIFIER = 0.1;

let reactorCount = 0;

export function resetReactorCount() {
  reactorCount = 0;
}

export default class AudioReactor extends Entity {
  static className = 'AudioReactor';

  static defaultProperties = {
    enabled: true,
    outputMode: 'Add',
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
    spectrum: {
      maxDecibels: -20,
      maxFrequency: ceil((SAMPLE_RATE / FFT_SIZE) * REACTOR_BINS),
      normalize: true,
      bins: REACTOR_BINS,
    },
  };

  constructor(properties) {
    reactorCount += 1;

    super(AudioReactor.className, {
      displayName: `Reactor ${reactorCount}`,
      ...AudioReactor.defaultProperties,
      ...properties,
    });

    Object.defineProperty(this, 'name', { value: 'AudioReactor' });

    this.parser = new SpectrumParser({ ...AudioReactor.defaultProperties.spectrum });

    this.result = { fft: [], output: 0 };
    this.direction = 1;
  }

  update(properties) {
    const keys = Object.keys(properties);

    if (contains(keys, ['selection', 'outputMode'])) {
      const { selection } = properties;
      if (selection) {
        const { x, y, width, height } = selection;
        const maxWidth = REACTOR_BARS * (REACTOR_BAR_WIDTH + REACTOR_BAR_SPACING);
        const maxHeight = REACTOR_BAR_HEIGHT;

        properties.range = {
          x1: x / maxWidth,
          x2: (x + width) / maxWidth,
          y1: y / maxHeight,
          y2: (y + height) / maxHeight,
        };
      }

      return super.update(properties);
    }

    return this.parser.update(properties);
  }

  getResult() {
    return this.result;
  }

  parse(data) {
    const { hasUpdate, fft: inputFft } = data;
    const fft = this.parser.parseFFT(inputFft);
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

    const avg = sum / (end - start);

    switch (outputMode) {
      case 'Add':
        output = avg;
        break;

      case 'Subtract':
        output = 1 - avg;
        break;

      case 'Forward':
        if (hasUpdate) {
          output += avg * CYCLE_MODIFIER;
          if (output > 1) {
            output = 1 - output;
          }
        }
        break;

      case 'Reverse':
        if (hasUpdate) {
          output -= avg * CYCLE_MODIFIER;
          if (output < 0) {
            output = 1 - output;
          }
        }
        break;

      case 'Cycle':
        if (hasUpdate) {
          if (this.direction > 0) {
            output += avg * CYCLE_MODIFIER;
            if (output > 1) {
              this.direction = -1;
            }
          } else {
            output -= avg * CYCLE_MODIFIER;
            if (output < 0) {
              this.direction = 1;
            }
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

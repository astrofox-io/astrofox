import cloneDeep from 'lodash/cloneDeep';
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
import { isDefined } from 'utils/array';
import { getDisplayName } from '../utils/controls';

const REACTOR_BINS = 64;
const CYCLE_MODIFIER = 0.1;

const outputOptions = ['Subtract', 'Add', 'Reverse', 'Forward', 'Cycle'];

const spectrumProperties = {
  maxDecibels: -20,
  smoothingTimeConstant: 0.5,
  maxFrequency: ceil((SAMPLE_RATE / FFT_SIZE) * REACTOR_BINS),
  normalize: true,
  bins: REACTOR_BINS,
};

export default class AudioReactor extends Entity {
  static info = {
    name: 'AudioReactor',
    description: 'Audio reactor.',
    type: 'reactor',
    label: 'Reactor',
  };

  static defaultProperties = {
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
    maxDecibels: -20,
    smoothingTimeConstant: 0.5,
  };

  static controls = {
    outputMode: {
      label: 'Output Mode',
      type: 'select',
      items: outputOptions,
    },
    maxDecibels: {
      label: 'Max dB',
      type: 'number',
      min: -40,
      max: 0,
      withRange: true,
    },
    smoothingTimeConstant: {
      label: 'Smoothing',
      type: 'number',
      min: 0,
      max: 0.99,
      step: 0.01,
      withRange: true,
    },
  };

  constructor(properties) {
    const {
      info: { name, label },
      defaultProperties,
    } = AudioReactor;

    super(name, { ...defaultProperties, ...properties });

    this.parser = new SpectrumParser({ ...spectrumProperties, ...properties });

    this.type = 'reactor';
    this.displayName = getDisplayName(label);
    this.enabled = true;
    this.result = { fft: [], output: 0 };
    this.direction = 1;
  }

  update(properties = {}) {
    const { selection, maxDecibels, smoothingTimeConstant } = properties;

    if (isDefined(maxDecibels, smoothingTimeConstant)) {
      this.parser.update(properties);
    }

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
    const { id, name, type, displayName, enabled, properties } = this;

    return {
      id,
      name,
      type,
      displayName,
      enabled,
      properties: cloneDeep(properties),
    };
  }
}

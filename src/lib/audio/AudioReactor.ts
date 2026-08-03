import {
  FFT_SIZE,
  REACTOR_BAR_HEIGHT,
  REACTOR_BAR_SPACING,
  REACTOR_BAR_WIDTH,
  REACTOR_BARS,
  SAMPLE_RATE,
} from '@/app/constants';
import FFTParser from '@/lib/audio/FFTParser';
import Entity from '@/lib/core/Entity';
import type { ReactorResult, RenderFrameData } from '@/lib/types';
import { isDefined } from '@/lib/utils/array';
import { getDisplayName } from '@/lib/utils/controls';
import { ceil, floor, normalize } from '@/lib/utils/math';

const REACTOR_BINS = 64;
const CYCLE_MODIFIER = 0.1;

const outputOptions = [
  'Add',
  'Subtract',
  'Forward',
  'Reverse',
  'Cycle',
  'Beat Trigger',
  'Beat Envelope',
  'Static Forward',
  'Static Reverse',
  'Static Cycle',
];

const beatOutputModes = ['Beat Trigger', 'Beat Envelope'];
const staticOutputModes = ['Static Forward', 'Static Reverse', 'Static Cycle'];

function isBeatMode(display: { properties: Record<string, unknown> }) {
  return beatOutputModes.includes(display.properties.outputMode as string);
}

function isStaticMode(display: { properties: Record<string, unknown> }) {
  return staticOutputModes.includes(display.properties.outputMode as string);
}

const spectrumProperties = {
  maxDecibels: -20,
  smoothingTimeConstant: 0.5,
  maxFrequency: ceil((SAMPLE_RATE / FFT_SIZE) * REACTOR_BINS),
  normalize: true,
  bins: REACTOR_BINS,
};

export default class AudioReactor extends Entity {
  parser: FFTParser;
  type: string;
  displayName: string;
  enabled: boolean;
  result: ReactorResult;
  direction: number;

  // Beat detection state
  energyHistory: number[] = [];
  historyIndex = 0;
  historyFilled = false;
  beatOutput = 0;
  holdCounter = 0;

  // Audio envelope state
  audioPeakOutput = 0;
  audioHoldCounter = 0;

  // Static state
  staticOutput = 0;
  staticDirection = 1;

  static config = {
    name: 'AudioReactor',
    description: 'Audio reactor.',
    type: 'reactor',
    label: 'Reactor',
    defaultProperties: {
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
      // Beat detection properties
      sensitivity: 1.3,
      holdTime: 6,
      decay: 0.9,
      historySize: 43,
      // Static properties
      speed: 0.5,
    },
    controls: {
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
        hidden: isStaticMode,
      },
      smoothingTimeConstant: {
        label: 'Smoothing',
        type: 'number',
        min: 0,
        max: 0.99,
        step: 0.01,
        withRange: true,
        hidden: isStaticMode,
      },
      sensitivity: {
        label: 'Sensitivity',
        type: 'number',
        min: 0.5,
        max: 3.0,
        step: 0.05,
        withRange: true,
        hidden: (display: { properties: Record<string, unknown> }) => !isBeatMode(display),
      },
      holdTime: {
        label: 'Hold Time',
        type: 'number',
        min: 1,
        max: 30,
        step: 1,
        withRange: true,
        hidden: isStaticMode,
      },
      decay: {
        label: 'Decay',
        type: 'number',
        min: 0.5,
        max: 0.99,
        step: 0.01,
        withRange: true,
        hidden: isStaticMode,
      },
      speed: {
        label: 'Speed',
        type: 'number',
        min: 0.01,
        max: 2.0,
        step: 0.01,
        withRange: true,
        hidden: (display: { properties: Record<string, unknown> }) =>
          !['Static Forward', 'Static Reverse', 'Static Cycle'].includes(
            display.properties.outputMode as string,
          ),
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    const {
      config: { name, label, defaultProperties },
    } = AudioReactor;

    super(name, { ...defaultProperties, ...properties });

    this.parser = new FFTParser({ ...spectrumProperties, ...properties });
    this.type = 'reactor';
    this.displayName = getDisplayName(label);
    this.enabled = true;
    this.result = { fft: [], output: 0 };
    this.direction = 1;

    const historySize = (this.properties as Record<string, number>).historySize;
    this.energyHistory = new Array(historySize).fill(0);
  }

  update(properties: Record<string, unknown> = {}) {
    const { selection, maxDecibels, smoothingTimeConstant, historySize } = properties;

    if (isDefined(maxDecibels, smoothingTimeConstant)) {
      this.parser.update(properties);
    }

    if (selection) {
      const { x, y, width, height } = selection as Record<string, number>;
      const maxWidth = REACTOR_BARS * (REACTOR_BAR_WIDTH + REACTOR_BAR_SPACING);
      const maxHeight = REACTOR_BAR_HEIGHT;

      properties.range = {
        x1: x / maxWidth,
        x2: (x + width) / maxWidth,
        y1: y / maxHeight,
        y2: (y + height) / maxHeight,
      };
    }

    if (historySize !== undefined) {
      const newSize = historySize as number;
      const oldHistory = this.energyHistory;
      this.energyHistory = new Array(newSize).fill(0);
      for (let i = 0; i < Math.min(oldHistory.length, newSize); i++) {
        this.energyHistory[i] = oldHistory[i];
      }
      this.historyIndex = Math.min(this.historyIndex, newSize - 1);
      this.historyFilled = false;
    }

    return super.update(properties);
  }

  getResult() {
    return this.result;
  }

  parse(data: RenderFrameData): ReactorResult {
    const { outputMode } = this.properties as { outputMode: string };

    // Static modes don't need FFT
    if (staticOutputModes.includes(outputMode)) {
      return this.parseStatic(data);
    }

    // Beat modes use beat detection algorithm
    if (beatOutputModes.includes(outputMode)) {
      return this.parseBeat(data);
    }

    // Audio modes use direct FFT mapping
    return this.parseAudio(data);
  }

  private parseAudio(data: RenderFrameData): ReactorResult {
    const { hasUpdate, fft: inputFft } = data;
    const fft = this.parser.parseFFT(inputFft!);
    const {
      outputMode,
      holdTime,
      decay,
      range: { x1, y1, x2, y2 },
    } = this.properties as Record<string, unknown> & {
      outputMode: string;
      holdTime: number;
      decay: number;
      range: { x1: number; y1: number; x2: number; y2: number };
    };
    const start = floor(x1 * fft.length);
    const end = ceil(x2 * fft.length);

    let { output } = this.result;
    let sum = 0;

    for (let i = start; i < end; i += 1) {
      sum += normalize(fft[i], 1 - y2, 1 - y1);
    }

    const avg = sum / (end - start);

    // Apply hold and decay to the energy input.
    // Hold preserves the peak for N frames, decay smooths the falloff.
    if (avg > this.audioPeakOutput) {
      this.audioPeakOutput = avg;
      this.audioHoldCounter = holdTime;
    } else if (this.audioHoldCounter > 0) {
      this.audioHoldCounter--;
    } else {
      this.audioPeakOutput *= decay;
      if (this.audioPeakOutput < 0.001) {
        this.audioPeakOutput = 0;
      }
    }

    const energy = this.audioPeakOutput;

    switch (outputMode) {
      case 'Add':
        output = energy;
        break;

      case 'Subtract':
        output = 1 - energy;
        break;

      case 'Forward':
        if (hasUpdate) {
          output += energy * CYCLE_MODIFIER;
          if (output > 1) {
            output = 1 - output;
          }
        }
        break;

      case 'Reverse':
        if (hasUpdate) {
          output -= energy * CYCLE_MODIFIER;
          if (output < 0) {
            output = 1 - output;
          }
        }
        break;

      case 'Cycle':
        if (hasUpdate) {
          if (this.direction > 0) {
            output += energy * CYCLE_MODIFIER;
            if (output > 1) {
              this.direction = -1;
            }
          } else {
            output -= energy * CYCLE_MODIFIER;
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

  private parseBeat(data: RenderFrameData): ReactorResult {
    const { hasUpdate, fft: inputFft } = data;
    const fft = this.parser.parseFFT(inputFft!);

    if (!hasUpdate) {
      return this.result;
    }

    const {
      outputMode,
      sensitivity,
      holdTime,
      decay,
      range: { x1, x2 },
    } = this.properties as {
      outputMode: string;
      sensitivity: number;
      holdTime: number;
      decay: number;
      range: { x1: number; x2: number };
    };

    // Calculate energy in the selected frequency range
    const startBin = Math.floor(x1 * fft.length);
    const endBin = Math.ceil(x2 * fft.length);
    const binCount = Math.max(1, endBin - startBin);

    let energy = 0;
    for (let i = startBin; i < endBin; i++) {
      energy += fft[i] * fft[i];
    }
    energy = energy / binCount;

    // Calculate running average energy from history
    const historyLength = this.historyFilled
      ? this.energyHistory.length
      : Math.max(1, this.historyIndex);
    let avgEnergy = 0;
    for (let i = 0; i < historyLength; i++) {
      avgEnergy += this.energyHistory[i];
    }
    avgEnergy = avgEnergy / historyLength;

    // Store current energy in circular buffer
    this.energyHistory[this.historyIndex] = energy;
    this.historyIndex = (this.historyIndex + 1) % this.energyHistory.length;
    if (this.historyIndex === 0) {
      this.historyFilled = true;
    }

    // Beat detection: current energy exceeds threshold
    const threshold = avgEnergy * sensitivity;
    const isBeat = energy > threshold && energy > 0.001;

    switch (outputMode) {
      case 'Beat Trigger':
        if (isBeat && this.holdCounter <= 0) {
          this.beatOutput = 1.0;
          this.holdCounter = holdTime;
        } else if (this.holdCounter > 0) {
          this.holdCounter--;
          if (this.holdCounter <= 0) {
            this.beatOutput = 0;
          }
        }
        break;

      case 'Beat Envelope':
        if (isBeat) {
          this.beatOutput = 1.0;
        } else {
          this.beatOutput *= decay;
          if (this.beatOutput < 0.001) {
            this.beatOutput = 0;
          }
        }
        break;
    }

    this.result.fft = fft;
    this.result.output = this.beatOutput;

    return this.result;
  }

  private parseStatic(data: RenderFrameData): ReactorResult {
    const { hasUpdate } = data;

    if (!hasUpdate) {
      return this.result;
    }

    const { outputMode, speed } = this.properties as {
      outputMode: string;
      speed: number;
    };

    const step = speed * CYCLE_MODIFIER;

    switch (outputMode) {
      case 'Static Forward':
        this.staticOutput += step;
        if (this.staticOutput > 1) {
          this.staticOutput -= 1;
        }
        break;

      case 'Static Reverse':
        this.staticOutput -= step;
        if (this.staticOutput < 0) {
          this.staticOutput += 1;
        }
        break;

      case 'Static Cycle':
        if (this.staticDirection > 0) {
          this.staticOutput += step;
          if (this.staticOutput >= 1) {
            this.staticOutput = 1;
            this.staticDirection = -1;
          }
        } else {
          this.staticOutput -= step;
          if (this.staticOutput <= 0) {
            this.staticOutput = 0;
            this.staticDirection = 1;
          }
        }
        break;
    }

    // Static modes produce no FFT output
    this.result.fft = [];
    this.result.output = this.staticOutput;

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
      properties: structuredClone(properties),
    };
  }
}

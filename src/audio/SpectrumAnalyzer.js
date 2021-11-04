import fft from 'fourier-transform';
import blackman from 'window-function/blackman';
import { FFT_SIZE } from 'view/constants';
import { mag2db, val2pct } from 'utils/math';
import { downmix } from 'utils/audio';

export default class SpectrumAnalyzer {
  static defaultProperties = {
    fftSize: FFT_SIZE,
    minDecibels: -100,
    maxDecibels: 0,
    smoothingTimeConstant: 0,
  };

  constructor(context, properties) {
    this.audioContext = context;

    this.analyzer = Object.assign(
      context.createAnalyser(),
      SpectrumAnalyzer.defaultProperties,
      properties,
    );

    const { fftSize, frequencyBinCount } = this.analyzer;

    this.fft = new Uint8Array(frequencyBinCount);
    this.td = new Float32Array(fftSize);

    this.blackmanTable = new Float32Array(fftSize);

    for (let i = 0; i < fftSize; i++) {
      this.blackmanTable[i] = blackman(i, fftSize);
    }

    this.buffer = context.createBuffer(1, fftSize, context.sampleRate);

    this.smoothing = new Float32Array(fftSize / 2);
  }

  get gain() {
    const { fft } = this;
    return fft.reduce((a, b) => a + b) / fft.length;
  }

  getFloatTimeDomainData(array) {
    array.set(this.buffer.getChannelData(0));
  }

  getFloatFrequencyData(array) {
    const { fftSize, smoothingTimeConstant } = this.analyzer;
    const waveform = new Float32Array(fftSize);

    // Get waveform from buffer
    this.getFloatTimeDomainData(waveform);

    // Apply blackman function
    for (let i = 0; i < fftSize; i++) {
      waveform[i] = waveform[i] * this.blackmanTable[i] || 0;
    }

    // Get FFT
    const spectrum = fft(waveform);

    for (let i = 0, n = fftSize / 2; i < n; i++) {
      let db = mag2db(spectrum[i]);

      if (smoothingTimeConstant) {
        this.smoothing[i] =
          spectrum[i] * smoothingTimeConstant * this.smoothing[i] + (1 - smoothingTimeConstant);

        db = mag2db(this.smoothing[i]);
      }

      array[i] = Number.isFinite(db) ? db : -Infinity;
    }
  }

  getByteTimeDomainData(array) {
    const { fftSize } = this.analyzer;
    const waveform = new Float32Array(fftSize);

    this.getFloatTimeDomainData(waveform);

    for (let i = 0, n = waveform.length; i < n; i++) {
      array[i] = Math.round(val2pct(waveform[i], -1, 1) * 255);
    }
  }

  getByteFrequencyData(array) {
    const { minDecibels, maxDecibels, frequencyBinCount } = this.analyzer;
    const spectrum = new Float32Array(frequencyBinCount);

    this.getFloatFrequencyData(spectrum);

    for (let i = 0, n = spectrum.length; i < n; i++) {
      array[i] = Math.round(val2pct(spectrum[i], minDecibels, maxDecibels) * 255);
    }
  }

  update(input) {
    if (input) {
      const data = downmix(input);
      this.buffer.copyToChannel(data, 0);
    }

    this.updateTimeData(input);
    this.updateFrequencyData(input);
  }

  updateFrequencyData(input) {
    if (input) {
      this.getByteFrequencyData(this.fft);
    } else {
      this.analyzer.getByteFrequencyData(this.fft);
    }
  }

  updateTimeData(input) {
    if (input) {
      this.getFloatTimeDomainData(this.td);
    } else {
      this.analyzer.getFloatTimeDomainData(this.td);
    }
  }

  reset() {
    this.fft.fill(0);
    this.td.fill(0);
  }
}

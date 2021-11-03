import { FFT_SIZE } from 'view/constants';

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
    this.fft = new Uint8Array(this.analyzer.frequencyBinCount);
    this.td = new Float32Array(this.analyzer.fftSize);
  }

  getFrequencyData() {
    return this.fft;
  }

  getTimeData() {
    return this.td;
  }

  getVolume() {
    return this.fft.reduce((a, b) => a + b) / this.fft.length;
  }

  update() {
    this.updateTimeData();
    this.updateFrequencyData();
  }

  updateFrequencyData() {
    this.analyzer.getByteFrequencyData(this.fft);
  }

  updateTimeData() {
    this.analyzer.getFloatTimeDomainData(this.td);
  }

  clearFrequencyData() {
    this.fft.fill(0);
  }

  clearTimeData() {
    this.td.fill(0);
  }

  static getMaxFrequency() {
    return this.audioContext.sampleRate / 2;
  }
}

import fft from 'fourier-transform';
import blackman from 'window-function/blackman';
import { FFT_SIZE, MAX_FFT_SIZE } from 'view/constants';
import { mag2db, val2pct, normalize } from 'utils/math';

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

    this.buffer = context.createBuffer(1, MAX_FFT_SIZE, context.sampleRate);
    this.bufferOffset = 0;

    this.smoothing = new Float32Array(fftSize / 2);
  }

  getFloatTimeDomainData(array) {
    const {
      bufferOffset,
      buffer,
      analyzer: { fftSize },
    } = this;
    const i0 = (bufferOffset - fftSize + MAX_FFT_SIZE) % MAX_FFT_SIZE;
    const i1 = Math.min(i0 + fftSize, MAX_FFT_SIZE);
    const copied = i1 - i0;
    const busData = buffer.getChannelData(0);

    array.set(busData.subarray(i0, i1));

    if (copied !== fftSize) {
      const remain = fftSize - copied;
      const subarray2 = busData.subarray(0, remain);

      array.set(subarray2, copied);
    }
  }

  getFloatFrequencyData(array) {
    const {
      analyzer: { fftSize, smoothingTimeConstant },
    } = this;
    const waveform = new Float32Array(fftSize);
    const length = Math.min(array.length, fftSize / 2);

    // 1. down-mix
    this.getFloatTimeDomainData(waveform);

    // 2. Apply Blackman window
    for (let i = 0; i < fftSize; i++) {
      waveform[i] = waveform[i] * this.blackmanTable[i] || 0;
    }

    // 3. FFT
    const spectrum = fft(waveform);

    // re-size to frequencyBinCount, then do more processing
    for (let i = 0; i < length; i++) {
      const v0 = spectrum[i];

      // 4. Smooth over data
      this.smoothing[i] =
        smoothingTimeConstant * this.smoothing[i] + (1 - smoothingTimeConstant) * v0;

      // 5. Convert to dB
      const v1 = mag2db(this.smoothing[i]);
      // store in array
      array[i] = Number.isFinite(v1) ? v1 : -Infinity;
    }
  }

  getByteTimeDomainData(array) {
    const { fftSize } = this.analyzer;
    const length = Math.min(array.length, fftSize);
    const waveform = new Float32Array(length);

    this.getFloatTimeDomainData(waveform);

    for (let i = 0; i < length; i++) {
      array[i] = Math.round(val2pct(waveform[i], -1, 1) * 255);
    }
  }

  getByteFrequencyData(array) {
    const {
      analyzer: { fftSize, minDecibels, maxDecibels },
    } = this;
    const length = Math.min(array.length, fftSize / 2);
    const spectrum = new Float32Array(length);

    this.getFloatFrequencyData(spectrum);

    for (let i = 0; i < length; i++) {
      const db = spectrum[i];
      const n = val2pct(db, minDecibels, maxDecibels);
      array[i] = Math.round(n * 255);
    }
  }

  getFrequencyData() {
    return this.fft;
  }

  getTimeData() {
    return this.td;
  }

  getGain() {
    return this.fft.reduce((a, b) => a + b) / this.fft.length;
  }

  update(data) {
    const { buffer, bufferOffset } = this;
    data = null;

    if (data) {
      buffer.copyToChannel(data, 0, bufferOffset);
      //const d = buffer.getChannelData(0).slice(data.length).concat(data);

      this.bufferOffset += data.length;
      if (this.bufferOffset >= MAX_FFT_SIZE) {
        this.bufferOffset = 0;
      }
    }

    this.updateTimeData(data);
    this.updateFrequencyData(data);
  }

  updateFrequencyData(data) {
    if (data) {
      this.getByteFrequencyData(this.fft);
    } else {
      this.analyzer.getByteFrequencyData(this.fft);
    }
  }

  updateTimeData(data) {
    if (data) {
      this.getFloatTimeDomainData(this.td);
    } else {
      this.analyzer.getFloatTimeDomainData(this.td);
    }
  }

  clear() {
    this.clearFrequencyData();
    this.clearTimeData();
  }

  clearFrequencyData() {
    this.fft.fill(0);
  }

  clearTimeData() {
    this.td.fill(0);
  }
}

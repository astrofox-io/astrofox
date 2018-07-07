import audioConfig from 'config/audio.json';

const { fftSize, sampleRate } = audioConfig;

export default class SpectrumAnalyzer {
    static defaultOptions = {
        fftSize,
        minDecibels: -100,
        maxDecibels: 0,
        smoothingTimeConstant: 0,
    }

    constructor(context, options) {
        this.audioContext = context;
        this.analyzer = Object.assign(context.createAnalyser(), SpectrumAnalyzer.defaultOptions, options);
        this.fft = new Uint8Array(this.analyzer.frequencyBinCount);
        this.td = new Float32Array(this.analyzer.fftSize);
    }

    getFrequencyData(update) {
        if (update) {
            this.analyzer.getByteFrequencyData(this.fft);
        }

        return this.fft;
    }

    getTimeData(update) {
        if (update) {
            this.analyzer.getFloatTimeDomainData(this.td);
        }

        return this.td;
    }

    getVolume() {
        return this.fft.reduce((a, b) => a + b) / this.fft.length;
    }

    clearFrequencyData() {
        this.fft.fill(0);
    }

    clearTimeData() {
        this.td.fill(0);
    }

    static getMaxFrequency() {
        return sampleRate / 2;
    }
}

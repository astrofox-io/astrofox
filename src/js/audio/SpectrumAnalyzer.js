const defaults = {
    fftSize: 1024,
    minDecibels: -100,
    maxDecibels: 0,
    smoothingTimeConstant: 0
};

export default class SpectrumAnalyzer {
    constructor(context, options) {
        this.audioContext = context;
        this.analyzer = Object.assign(context.createAnalyser(), defaults, options);
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

    clearFrequencyData() {
        this.fft.fill(0);
    }

    clearTimeData() {
        this.td.fill(0);
    }

    getMaxFrequency() {
        return this.audioContext.sampleRate / 2;
    }
}
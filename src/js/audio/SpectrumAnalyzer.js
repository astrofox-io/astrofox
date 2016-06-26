'use strict';

const defaults = {
    fftSize: 1024,
    minDecibels: -100,
    maxDecibels: 0,
    smoothingTimeConstant: 0
};

class SpectrumAnalyzer {
    constructor(context) {
        this.audioContext = context;
        this.analyzer = Object.assign(context.createAnalyser(), defaults);
        this.fft = new Uint8Array(this.analyzer.frequencyBinCount);
        this.td = new Float32Array(this.analyzer.frequencyBinCount);
        this.enabled = true;
    }

    getFrequencyData() {
        let analyzer = this.analyzer,
            fft = this.fft;

        if (this.enabled) {
            analyzer.getByteFrequencyData(fft);
        }

        return fft;
    }

    getTimeData() {
        let analyzer = this.analyzer,
            td = this.td;

        if (this.enabled) {
            analyzer.getFloatTimeDomainData(td);
        }

        return td;
    }

    clearFrequencyData() {
        this.fft.fill(0);
    }

    clearTimeData(data) {
        this.td.fill(0);
    }

    getMaxFrequency() {
        return this.audioContext.sampleRate / 2;
    }
}

module.exports = SpectrumAnalyzer;
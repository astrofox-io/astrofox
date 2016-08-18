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
        console.log(this.analyzer.frequencyBinCount, this.analyzer.fftSize);
        this.td = new Float32Array(this.analyzer.fftSize);
        this.enabled = true;
    }

    getFrequencyData() {
        if (this.enabled) {
            this.analyzer.getByteFrequencyData(this.fft);
        }

        return this.fft;
    }

    getTimeData() {
        if (this.enabled) {
            this.analyzer.getFloatTimeDomainData(this.td);
        }

        return this.td;
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
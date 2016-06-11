'use strict';

var _ = require('lodash');

var defaults = {
    fftSize: 1024,
    minDecibels: -100,
    maxDecibels: 0,
    smoothingTimeConstant: 0
};

var SpectrumAnalyzer = function(context) {
    this.audioContext = context;
    this.analyzer = _.extend(context.createAnalyser(), defaults);
    this.fft = new Uint8Array(this.analyzer.frequencyBinCount);
    this.td = new Float32Array(this.analyzer.frequencyBinCount);
    this.enabled = true;
};

SpectrumAnalyzer.prototype = {
    constructor: SpectrumAnalyzer,

    getFrequencyData: function() {
        var analyzer = this.analyzer,
            fft = this.fft;

        if (this.enabled) {
            analyzer.getByteFrequencyData(fft);
        }

        return fft;
    },

    getTimeData: function() {
        var analyzer = this.analyzer,
            td = this.td;

        if (this.enabled) {
            analyzer.getFloatTimeDomainData(td);
        }

        return td;
    },

    getMaxFrequency: function() {
        return this.audioContext.sampleRate / 2;
    }
};

module.exports = SpectrumAnalyzer;
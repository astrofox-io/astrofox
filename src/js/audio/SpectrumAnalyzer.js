'use strict';

var _ = require('lodash');

var defaults = {
    fftSize: 2048,
    minDecibels: -100,
    maxDecibels: 0,
    smoothingTimeConstant: 0
};

var SpectrumAnalyzer = function(context) {
    this.audioContext = context;
    this.analyzer = _.extend(context.createAnalyser(), defaults);
};

SpectrumAnalyzer.prototype = {
    constructor: SpectrumAnalyzer,

    getFrequencyData: function() {
        var analyzer = this.analyzer,
            fft = new Float32Array(analyzer.frequencyBinCount);

        analyzer.getFloatFrequencyData(fft);

        return fft;
    },

    getTimeData: function() {
        var data = new Array(this.analyzer.frequencyBinCount);

        return data;
    },

    getMaxFrequency: function() {
        return this.audioContext.sampleRate / 2;
    }
};

module.exports = SpectrumAnalyzer;
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
};

SpectrumAnalyzer.prototype = {
    constructor: SpectrumAnalyzer,

    getFrequencyData: function() {
        var analyzer = this.analyzer,
            //fft = new Float32Array(analyzer.frequencyBinCount);
            fft = new Uint8Array(analyzer.frequencyBinCount);

        //analyzer.getFloatFrequencyData(fft);
        analyzer.getByteFrequencyData(fft);

        return fft;
    },

    getTimeData: function() {
        var analyzer = this.analyzer,
            data = new Uint8Array(analyzer.frequencyBinCount);

        analyzer.getByteTimeDomainData(data);

        return data;
    },

    getMaxFrequency: function() {
        return this.audioContext.sampleRate / 2;
    }
};

module.exports = SpectrumAnalyzer;
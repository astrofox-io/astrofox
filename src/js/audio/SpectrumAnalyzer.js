'use strict';

var _ = require('lodash');

var defaults = {
    minDecibels: -100,
    maxDecibels: 0,
    minFrequency: 0,
    maxFrequency: 22050,
    smoothingTimeConstant: 0
};

var SpectrumAnalyzer = function(context, analyzer, options) {
    this.audioContext = context;
    this.analyzer = analyzer;
    this.data = null;
    this.options =_.assign({}, defaults);

    this.init(options);
};

SpectrumAnalyzer.prototype.init = function(options) {
    if (typeof options !== 'undefined') {
        for (var prop in options) {
            if (this.options.hasOwnProperty(prop)) {
                this.options[prop] = options[prop];
            }
        }
    }
};

SpectrumAnalyzer.prototype.getFrequencyData = function() {
    var fft = new Float32Array(this.analyzer.frequencyBinCount);

    this.analyzer.getFloatFrequencyData(fft);

    return this.parseFrequencyData(fft, this.audioContext.sampleRate, this.analyzer.fftSize);
};

SpectrumAnalyzer.prototype.parseFrequencyData = function(fft, sampleRate, fftSize) {
    var i,
        options = this.options,
        last = this.data,
        sampleRate = sampleRate || this.audioContext.sampleRate,
        fftSize = fftSize || this.analyzer.fftSize,
        range = sampleRate / fftSize,
        minVal = db2mag(options.minDecibels),
        maxVal = db2mag(options.maxDecibels),
        minBin = floor(options.minFrequency / range),
        maxBin = floor(options.maxFrequency / range),
        smoothing = (last && last.length === maxBin) ? options.smoothingTimeConstant : 0,
        data = new Float32Array(maxBin);

    // Convert db to magnitude
    for (i = minBin; i < maxBin; i++) {
        data[i] = convertDb(fft[i], minVal, maxVal);
    }

    // Apply smoothing
    if (smoothing > 0) {
        for (i = 0; i < maxBin; i++) {
            data[i] = (last[i] * smoothing) + (data[i] * (1.0 - smoothing));
        }
    }

    this.data = data;

    return data;
};

SpectrumAnalyzer.getTimeData = function() {
    var data = new Array(this.analyzer.frequencyBinCount);

    return data;
};

SpectrumAnalyzer.prototype.getMaxFrequency = function() {
    return this.audioContext.sampleRate / 2;
};

function convertDb(db, min, max) {
    var val = db2mag(db);
    if (val > max) val = max;
    return (val - min) / (max - min);
}

function round(val) {
    return (val + 0.5) << 0;
}

function ceil(val) {
    var n = (val << 0);
    return (n == val) ? n : n + 1;
}

function floor(val) {
    return ~~val;
}

function db2mag(val) {
    // Math.pow(10, 0.05 * val);
    return Math.exp(0.1151292546497023 * val);
}

function mag2db(val) {
    // 20 * log10(db)
    return 20 * log10(val);
}

function log10(val) {
    return Math.log(val) / Math.LN10;
}

module.exports = SpectrumAnalyzer;
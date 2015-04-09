'use strict';

var _ = require('lodash');

var _defaults = {
    minDecibels: -100,
    maxDecibels: 0,
    minFrequency: 0,
    maxFrequency: 22050,
    smoothingTimeConstant: 0
};

var defaults = {
    fftSize: 2048,
    minDecibels: -100,
    maxDecibels: 0,
    smoothingTimeConstant: 0
};

var SpectrumAnalyzer = function(context, options) {
    this.audioContext = context;
    this.analyzer = _.extend(context.createAnalyser(), defaults);
    this.options = _.assign({}, _defaults);
    this.data = null;

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

SpectrumAnalyzer.prototype.getFrequencyData = function(options) {
    var analyzer = this.analyzer,
        fft = new Float32Array(analyzer.frequencyBinCount);

    analyzer.getFloatFrequencyData(fft);

    return this.parseFrequencyData(fft, options);
};

SpectrumAnalyzer.prototype.parseFrequencyData = function(fft, options) {
    if (!options) options = {};

    var i,
        last = this.data,
        sampleRate = options.sampleRate || this.audioContext.sampleRate,
        fftSize = options.fftSize || this.analyzer.fftSize,
        range = sampleRate / fftSize,
        minDb = options.minDecibels || -100,
        maxDb = options.maxDecibels || 0,
        minHz = options.minFrequency || 0,
        maxHz = options.maxFrequency || 22050,
        minVal = db2mag(minDb),
        maxVal = db2mag(maxDb),
        minBin = floor(minHz / range),
        maxBin = floor(maxHz / range),
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

    // Save data for smoothing calculations
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
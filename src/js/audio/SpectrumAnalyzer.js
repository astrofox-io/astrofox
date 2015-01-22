'use strict';

var _ = require('lodash');

var defaults = {
    minDecibels: -100,
    maxDecibels: 0,
    fftSize: 2048,
    smoothingTimeConstant: 0
};

var SpectrumAnalyzer = function(context, analyzer, options) {
    this.audioContext = context;
    this.analyzer = analyzer || this.audioContext.createAnalyser();
    this.id = null;
    this.fft = null;
    this.options = {};

    this.init(options);
};

SpectrumAnalyzer.prototype.init = function(options) {
    this.options = _.assign({}, defaults, options);

    for (var prop in this.options) {
        if (this.analyzer.hasOwnProperty(prop)) {
            this.analyzer[prop] = this.options[prop];
        }
    }
};

SpectrumAnalyzer.prototype.connect = function(sound) {
    sound.connect(this.analyzer);
};

SpectrumAnalyzer.prototype.disconnect = function() {
    this.analyzer.disconnect();
};

SpectrumAnalyzer.prototype.getFrequencyData = function(id) {
    var fft = new Float32Array(this.analyzer.frequencyBinCount);

    if (typeof id !== 'undefined' && this.id === id && this.fft !== null) {
        fft = this.fft;
    }
    else {
        this.analyzer.getFloatFrequencyData(fft);
        this.fft = fft;
        this.id = id;
    }

    //console.log(fft);

    return fft;
};

SpectrumAnalyzer.prototype.parseFrequencyData = function(fft, minDB, maxDB, minFreq, maxFreq, smoothing, lastData) {
    var i,
        options = this.options,
        range = this.audioContext.sampleRate / this.analyzer.fftSize,
        minVal = db2mag(minDB),
        maxVal = db2mag(maxDB),
        minBin = floor(minFreq / range),
        maxBin = floor(maxFreq / range),
        results = new Float32Array(maxBin);

    if (fft === null) fft = this.getFrequencyData();

    // Convert db to magnitude
    for (i = minBin; i < maxBin; i++) {
        results[i] = convertDb(fft[i], minVal, maxVal);
    }

    // Apply smoothing
    smoothing = (lastData && lastData.length === maxBin) ? smoothing : 0;
    if (smoothing > 0) {
        for (i = 0; i < maxBin; i++) {
            results[i] = (lastData[i] * smoothing) + (results[i] * (1.0 - smoothing));
        }
    }

    return results;
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
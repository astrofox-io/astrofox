'use strict';

var _ = require('lodash');

var defaults = {
    minDecibels: -100,
    maxDecibels: -8,
    fftSize: 2048,
    smoothingTimeConstant: 0.5,
    minFrequency : 0,
    maxFrequency : 3000,
    bars: 128
};

var BeatAnalyzer = function(context, options) {
    this.audioContext = context;
    this.analyzer = this.audioContext.createAnalyser();
    this.options = {};

    this.init(options);
};

module.exports = BeatAnalyzer;
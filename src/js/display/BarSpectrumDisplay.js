'use strict';

var Class = require('../core/Class.js');
var BarDisplay = require('./BarDisplay.js');
var SpectrumParser = require('../audio/SpectrumParser.js');
var _ = require('lodash');

var defaults = {
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -12,
    minFrequency: 0,
    maxFrequency: 3000,
    fftSize: 2048,
    sampleRate: 44100
};

var BarSpectrumDisplay = function(canvas, options) {
    BarDisplay.apply(this, arguments);

    this.data = null;
    this.options = _.assign({}, defaults, this.options);

    this.init(options);
};

Class.extend(BarSpectrumDisplay, BarDisplay, {
    renderToCanvas: function(context, frame, fft) {
        var data,
            options = this.options,
            width = options.width / 2,
            height = options.height;

        data = this.data = SpectrumParser.parseFFT(fft, options, this.data);

        this.render(data, options);

        if (options.rotation % 360 !== 0) {
            context.save();
            context.translate(options.x, options.y - options.height);
            context.translate(width, height);
            context.rotate(options.rotation * Math.PI / 180);
            context.drawImage(this.canvas, -width, -height);
            context.restore();
        }
        else {
            context.drawImage(this.canvas, options.x, options.y - options.height);
        }
    }
});

module.exports = BarSpectrumDisplay;
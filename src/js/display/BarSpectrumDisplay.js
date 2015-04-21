'use strict';

var Class = require('../core/Class.js');
var BarDisplay = require('./BarDisplay.js');
var DisplayComponent = require('./DisplayComponent.js');
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

var id = 0;

var BarSpectrumDisplay = function(canvas, options) {
    DisplayComponent.call(this, id++, 'BarSpectrumDisplay', '2d', canvas);

    this.bars = new BarDisplay(this.canvas, options);
    this.options = _.assign({}, defaults, this.options);
    this.data = null;

    this.init(options);
};

Class.extend(BarSpectrumDisplay, DisplayComponent, {
    init: function (options) {
        if (typeof options !== 'undefined') {
            for (var prop in options) {
                if (this.options.hasOwnProperty(prop)) {
                    this.options[prop] = options[prop];
                }
            }

            this.bars.init(options);
            this.initialized = true;
        }
    },

    renderToCanvas: function(context, frame, fft) {
        var data,
            options = this.options,
            barOptions = this.bars.options,
            width = barOptions.width / 2,
            height = barOptions.height;

        data = this.data = SpectrumParser.parseFFT(fft, options, this.data);

        this.bars.render(data);

        if (barOptions.rotation % 360 !== 0) {
            context.save();
            context.translate(barOptions.x, barOptions.y - height);
            context.translate(width, height);
            context.rotate(barOptions.rotation * Math.PI / 180);
            context.drawImage(this.canvas, -width, -height);
            context.restore();
        }
        else {
            context.drawImage(this.canvas, barOptions.x, barOptions.y - height);
        }
    }
});

module.exports = BarSpectrumDisplay;
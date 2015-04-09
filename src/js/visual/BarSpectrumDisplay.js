'use strict';

var BarDisplay = require('./BarDisplay.js');
var _ = require('lodash');

var defaults = {
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -12,
    minFrequency: 0,
    maxFrequency: 3000
};

var id = 0;

var BarSpectrumDisplay = function(canvas, options) {
    BarDisplay.call(this, canvas, options);

    this.options = _.assign({}, defaults, this.options);
    this.analyzer = null;

    this.id = id++;
    this.name = 'BarSpectrumDisplay';
    this.type = '2d';
    this.initialized = false;

    this.init(options);
};

BarSpectrumDisplay.prototype = _.create(BarDisplay.prototype, {
    constructor: BarSpectrumDisplay,

    renderToCanvas: function(context, frame, fft) {
        if (this.analyzer) {
            var data,
                options = this.options,
                width = options.width / 2,
                height = options.height;

            data = this.analyzer.parseFrequencyData(fft, options);

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
    }
});

module.exports = BarSpectrumDisplay;
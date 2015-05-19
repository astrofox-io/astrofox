'use strict';

var _ = require('lodash');
var Class = require('../core/Class.js');
var BarDisplay = require('./BarDisplay.js');
var Display = require('./Display.js');
var SpriteDisplay = require('./SpriteDisplay.js');
var SpectrumParser = require('../audio/SpectrumParser.js');

var defaults = {
    height: 300,
    width: 200,
    x: 0,
    y: 0,
    barWidth: -1,
    barSpacing: -1,
    barWidthAutoSize: 1,
    barSpacingAutoSize: 1,
    shadowHeight: 100,
    color: '#ffffff',
    shadowColor: '#cccccc',
    rotation: 0,
    opacity: 1.0,

    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -12,
    minFrequency: 0,
    maxFrequency: 3000,
    fftSize: 2048,
    sampleRate: 44100
};

var id = 0;

var BarSpectrumDisplay = function(options) {
    SpriteDisplay.call(this, id++, 'BarSpectrumDisplay', '2d', defaults);

    this.bars = new BarDisplay(this.canvas, options);
    this.data = null;

    this.update(options);
};

BarSpectrumDisplay.info = {
    name: 'Bar Spectrum'
};

Class.extend(BarSpectrumDisplay, SpriteDisplay, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

        this.bars.update(options);

        return changed;
    },

    renderToCanvas: function(scene, payload) {
        var data = this.data = SpectrumParser.parseFFT(payload.fft, this.options, this.data);
        this.bars.render(data);

        this._super.renderToCanvas.call(this, scene);
    },

    renderToCanvasQQQ: function(scene, payload) {
        var data,
            context = scene.context2d,
            options = this.options,
            barOptions = this.bars.options,
            width = barOptions.width / 2,
            height = barOptions.height;

        data = this.data = SpectrumParser.parseFFT(payload.fft, options, this.data);

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
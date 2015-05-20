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
var RADIANS = 0.017453292519943295;

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

        var x, y,
            canvas = this.canvas,
            options = this.options,
            barOptions = this.bars.options,
            context = scene.context2d,
            halfWidth = canvas.width / 2,
            halfHeight = barOptions.height,
            size = scene.getSize(),
            halfSceneWidth = size.width / 2,
            halfSceneHeight = size.height / 2;


        if (options.rotation % 360 !== 0) {
            x = halfSceneWidth + options.x;
            y = halfHeight - options.y;

            context.save();
            context.translate(x, y);
            context.rotate(options.rotation * RADIANS);
            context.drawImage(canvas, -halfWidth, -halfHeight);
            context.restore();
        }
        else {
            x = halfSceneWidth - halfWidth + options.x;
            y = halfSceneHeight - halfHeight - options.y;

            context.drawImage(canvas, x, y);
        }
    }
});

module.exports = BarSpectrumDisplay;
'use strict';

var _ = require('lodash');
var CanvasDisplay = require('../display/CanvasDisplay.js');
var WaveDisplay = require('../display/WaveDisplay.js');

var defaults = {
    color: '#ffffff',
    height: 240,
    width: 854,
    x: 0,
    y: 0,
    lineWidth: 1.0,
    rotation: 0,
    opacity: 1.0
};

var SoundwaveDisplay = function(options) {
    CanvasDisplay.call(this, 'SoundwaveDisplay', defaults);

    this.wave = new WaveDisplay(this.canvas, options);

    this.update(options);
};

SoundwaveDisplay.info = {
    name: 'Soundwave'
};

SoundwaveDisplay.prototype = _.create(CanvasDisplay.prototype, {
    constructor: SoundwaveDisplay,

    update: function(options) {
        this.wave.update(options);

        return CanvasDisplay.prototype.update.call(this, options);
    },

    renderToCanvas: function(scene, data) {
        this.wave.render(data.td, data.playing);

        CanvasDisplay.prototype.renderToCanvas.call(this, scene);
    }
});

module.exports = SoundwaveDisplay;
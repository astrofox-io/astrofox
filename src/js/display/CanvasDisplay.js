'use strict';

var _ = require('lodash');
var Display = require('../display/Display.js');

var RADIANS = 0.017453292519943295;

var CanvasDisplay = function(name, options) {
    Display.call(this, name, options);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
};

CanvasDisplay.prototype = _.create(Display.prototype, {
    constructor: CanvasDisplay,

    renderToCanvas: function(context) {
        var x, y,
            canvas = this.canvas,
            options = this.options,
            halfWidth = canvas.width / 2,
            halfHeight = canvas.height / 2,
            halfSceneWidth = context.canvas.width / 2,
            halfSceneHeight = context.canvas.height / 2;


        if (options.rotation % 360 !== 0) {
            x = halfSceneWidth + options.x;
            y = halfSceneHeight - options.y;

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

module.exports = CanvasDisplay;
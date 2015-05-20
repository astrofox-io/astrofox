'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('../core/Class.js');
var Display = require('../display/Display.js');

var RADIANS = 0.017453292519943295;

var SpriteDisplay = function() {
    Display.apply(this, arguments);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
};

Class.extend(SpriteDisplay, Display, {
    renderToCanvas: function(scene) {
        var x, y,
            canvas = this.canvas,
            options = this.options,
            context = scene.context2d,
            halfWidth = canvas.width / 2,
            halfHeight = canvas.height / 2,
            size = scene.getSize(),
            halfSceneWidth = size.width / 2,
            halfSceneHeight = size.height / 2;


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

module.exports = SpriteDisplay;
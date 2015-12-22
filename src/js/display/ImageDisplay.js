'use strict';

var _ = require('lodash');
var Class = require('core/Class.js');
var CanvasDisplay = require('display/CanvasDisplay.js');

var defaults = {
    src: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fixed: true,
    rotation: 0,
    opacity: 1.0
};

var BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

var ImageDisplay = function(options) {
    CanvasDisplay.call(this, 'ImageDisplay', defaults);

    this.image = new Image();

    this.update(options);
};

ImageDisplay.info = {
    name: 'Image'
};

Class.extend(ImageDisplay, CanvasDisplay, {
    update: function(options) {
        var changed = CanvasDisplay.prototype.update.call(this, options);

        if (this.image.src !== this.options.src) {
            this.image.src = this.options.src;
        }

        return changed;
    },

    render: function() {
        var width, height,
            canvas = this.canvas,
            context = this.context,
            options = this.options,
            img = this.image;

        if (!options.src) return;

        // Reset canvas
        canvas.width = options.width;
        canvas.height = options.height;

        // Get original dimensions
        width = img.naturalWidth;
        height = img.naturalHeight;

        // Resize smaller
        if (options.width < width && options.height < height) {
            var buffer = document.createElement('canvas'),
                bufferContext = buffer.getContext('2d');

            // Draw image at original size
            buffer.width = width;
            buffer.height = height;
            bufferContext.drawImage(img, 0, 0, width, height);

            width /= 2;
            height /= 2;

            // Step down
            while (width >= 1 && height >= 1 && width > options.width && height > options.height) {
                bufferContext.drawImage(buffer, 0, 0, buffer.width, buffer.height, 0, 0, buffer.width/2, buffer.height/2);
                width /= 2;
                height /= 2;
            }

            context.globalAlpha = options.opacity;
            context.drawImage(buffer, 0, 0, width*2, height*2, 0, 0, options.width, options.height);
        }
        // Draw normally
        else {
            context.globalAlpha = options.opacity;
            context.drawImage(img, 0, 0, options.width, options.height);
        }
    }
});

module.exports = ImageDisplay;

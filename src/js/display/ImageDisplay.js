'use strict';

var _ = require('lodash');
var Class = require('../core/Class.js');
var Display = require('./Display.js');
var SpriteDisplay = require('./SpriteDisplay.js');

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

var id = 0;
var BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

var ImageDisplay = function(options) {
    SpriteDisplay.call(this, id++, 'ImageDisplay', '2d', defaults);

    this.image = new Image();

    this.update(options);
};

ImageDisplay.info = {
    name: 'Image'
};

Class.extend(ImageDisplay, SpriteDisplay, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

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

        console.log('image rendered', performance.now());
    }
});

function sharpen(ctx, w, h, mix) {
    var x, sx, sy, r, g, b, a, dstOff, srcOff, wt, cx, cy, scy, scx,
        weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
        katet = Math.round(Math.sqrt(weights.length)),
        half = (katet * 0.5) | 0,
        dstData = ctx.createImageData(w, h),
        dstBuff = dstData.data,
        srcBuff = ctx.getImageData(0, 0, w, h).data,
        y = h;

    while (y--) {
        x = w;
        while (x--) {
            sy = y;
            sx = x;
            dstOff = (y * w + x) * 4;
            r = 0;
            g = 0;
            b = 0;
            a = 0;

            for (cy = 0; cy < katet; cy++) {
                for (cx = 0; cx < katet; cx++) {
                    scy = sy + cy - half;
                    scx = sx + cx - half;

                    if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                        srcOff = (scy * w + scx) * 4;
                        wt = weights[cy * katet + cx];

                        r += srcBuff[srcOff] * wt;
                        g += srcBuff[srcOff + 1] * wt;
                        b += srcBuff[srcOff + 2] * wt;
                        a += srcBuff[srcOff + 3] * wt;
                    }
                }
            }

            dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
            dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
            dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
            dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
        }
    }

    ctx.putImageData(dstData, 0, 0);
}

module.exports = ImageDisplay;

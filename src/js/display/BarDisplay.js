'use strict';

var _ = require('lodash');

var defaults = {
    height: 300,
    width: 200,
    x: 0,
    y: 150,
    barWidth: -1,
    barSpacing: -1,
    barWidthAutoSize: 1,
    barSpacingAutoSize: 1,
    shadowHeight: 100,
    color: '#ffffff',
    shadowColor: '#cccccc',
    rotation: 0,
    opacity: 1.0
};

var BarDisplay = function(canvas, options) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.options = _.assign({}, defaults);

    this.update(options);
};

BarDisplay.prototype = {
    update: function(options) {
        if (typeof options === 'object') {
            for (var prop in options) {
                if (hasOwnProperty.call(this.options, prop)) {
                    this.options[prop] = options[prop];

                    if (prop === 'width') {
                        this.canvas.width = options.width;
                    }
                    else if (prop === 'height' || prop === 'shadowHeight') {
                        this.canvas.height = options.height + options.shadowHeight;
                    }
                }
            }
        }
    },

    render: function(data) {
        var i, x, y, val, step, index, last, barSize, fullWidth,
            len = data.length,
            context = this.context,
            options = this.options,
            height = options.height,
            width = options.width,
            barWidth = options.barWidth,
            barSpacing = options.barSpacing,
            shadowHeight = options.shadowHeight,
            color = options.color,
            shadowColor = options.shadowColor;

        // Reset canvas
        context.clearRect(0, 0, width, height + shadowHeight);

        // Calculate bar widths
        if (barWidth < 0 && barSpacing < 0) {
            barWidth = barSpacing = (width / len) / 2;
        }
        else if (barSpacing >= 0 && barWidth < 0) {
            barWidth = (width - (len * barSpacing)) / len;
            if (barWidth <= 0) barWidth = 1;
        }
        else if (barWidth > 0 && barSpacing < 0) {
            barSpacing = (width - (len * barWidth)) / len;
            if (barSpacing <= 0) barSpacing = 1;
        }

        // Calculate bars to display
        barSize = barWidth + barSpacing;
        fullWidth = barSize * len;

        // Stepping
        step = (fullWidth > width) ? fullWidth / width : 1;

        // Set opacity
        context.globalAlpha = options.opacity;

        // Draw bars
        this.setColor(color, 0, 0, 0, height);

        for (i = 0, x = 0, y = height, last = null; i < len && x < fullWidth; i += step, x += barSize) {
            index = ~~i;
            if (index === last) continue;
            val = data[index] * height;
            last = index;

            context.fillRect(x, y, barWidth, -val);
        }

        // Draw shadow bars
        if (shadowHeight > 0) {
            this.setColor(shadowColor, 0, height, 0, height + shadowHeight);

            for (i = 0, x = 0, y = height, last = null; i < len && x < fullWidth; i += step, x += barSize) {
                index = ~~i;
                if (index === last) continue;
                val = data[index] * shadowHeight;
                last = index;

                context.fillRect(x, y, barWidth, val);
            }
        }
    },

    setColor: function(color, x1, y1, x2, y2) {
        var i, gradient, len,
            context = this.context;

        if (color instanceof Array) {
            len = color.length;
            gradient = this.context.createLinearGradient(x1, y1, x2, y2);
            for (i = 0; i < len; i++) {
                gradient.addColorStop(i / (len - 1), color[i]);
            }
            context.fillStyle = gradient;
        }
        else {
            context.fillStyle = color;
        }
    },

    getColor: function(start, end, pct) {
        var startColor = {
            r: parseInt(start.substring(1,3), 16),
            g: parseInt(start.substring(3,5), 16),
            b: parseInt(start.substring(5,7), 16)
        };

        var endColor = {
            r: parseInt(end.substring(1,3), 16),
            g: parseInt(end.substring(3,5), 16),
            b: parseInt(end.substring(5,7), 16)
        };

        var c = {
            r: ~~((endColor.r - startColor.r) * pct) + startColor.r,
            g: ~~((endColor.g - startColor.g) * pct) + startColor.g,
            b: ~~((endColor.b - startColor.b) * pct) + startColor.b
        };

        return '#' + c.r.toString(16) + c.g.toString(16) + c.b.toString(16);
    }
};

function round(val) {
    return (val + 0.5) << 0;
}

function ceil(val) {
    var n = (val << 0);
    return (n == val) ? n : n + 1;
}

function floor(val) {
    return ~~val;
}

module.exports = BarDisplay;
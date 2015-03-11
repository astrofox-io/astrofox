'use strict';

var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');

var defaults = {
    x: 0,
    y: 150,
    height: 300,
    width: 200,
    barWidth: -1,
    barSpacing: -1,
    color: '#ffffff',
    shadowHeight: 100,
    shadowColor: '#cccccc',
    rotation: 0,
    opacity: 1.0
};

var id = 0;

var BarDisplay = EventEmitter.extend({
    constructor: function(canvas, options) {
        this.id = id++;
        this.name = 'bar';
        this.canvas = canvas || document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.analyzer = null;
        this.options = _.assign({}, defaults);

        this.init(options);
    }
});

BarDisplay.prototype.init = function(options) {
    if (typeof options !== 'undefined') {
        for (var prop in options) {
            if (this.options.hasOwnProperty(prop)) {
                this.options[prop] = options[prop];
            }
        }
        if (this.analyzer) {
            this.analyzer.init(options);
        }
    }
};

BarDisplay.prototype.render = function(data) {
    var i, x, y, val, size, totalWidth,
        step = 1,
        len = data.length,
        canvas = this.canvas,
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
    canvas.width = options.width;
    canvas.height = options.height + options.shadowHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate bar widths
    if (barWidth < 0 && barSpacing < 0) {
        barWidth = barSpacing = (width / len) / 2;
    }
    else if (barSpacing > 0 && barWidth < 0) {
        barWidth = (width - (len * barSpacing)) / len;
        if (barWidth <= 0) barWidth = 1;
    }
    else if (barWidth > 0 && barSpacing < 0) {
        barSpacing = (width - (len * barWidth)) / len;
        if (barSpacing <= 0) barSpacing = 1;
    }

    // Calculate bars to display
    size = barWidth + barSpacing;
    totalWidth = size * len;

    if (totalWidth > width) {
        step = totalWidth / width;
    }

    // Set opacity
    context.globalAlpha = options.opacity;

    // Draw bars
    this.setColor(color, 0, 0, 0, height);

    for (i = 0, x = 0, y = height; i < len; i += step, x += size) {
        val = data[floor(i)] * height;
        context.fillRect(x, y, barWidth, -val);
    }

    // Draw shadow bars
    if (shadowHeight > 0) {
        this.setColor(shadowColor, 0, height, 0, height + shadowHeight);

        for (i = 0, x = 0, y = height; i < len; i += step, x += size) {
            val = data[floor(i)] * shadowHeight;
            context.fillRect(x, y, barWidth, val);
        }
    }
};

BarDisplay.prototype.renderToCanvas = function(context, frame, fft) {
    if (this.analyzer) {
        var data,
            options = this.options,
            width = options.width / 2,
            height = options.height;

        data = this.analyzer.parseFrequencyData(fft);

        this.render(data);

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
};

BarDisplay.prototype.setColor = function(color, x1, y1, x2, y2) {
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
};

BarDisplay.prototype.toString = function() {
    return 'BarDisplay' + this.id;
};

function getColor(start, end, pct) {
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
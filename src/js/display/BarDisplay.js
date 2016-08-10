'use strict';

const Display = require('./Display.js');

class BarDisplay extends Display {
    constructor(canvas, options) {
        super('BarDisplay', BarDisplay.defaults);
        
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.update(options);
    }
    
    update(options) {
        let changed = super.update(options);

        if (changed) {
            if (options.width !== undefined) {
                this.canvas.width = this.options.width;
            }
            if (options.height !== undefined || options.shadowHeight !== undefined) {
                this.canvas.height = this.options.height + this.options.shadowHeight;
            }
        }

        return changed;
    }

    render(data) {
        let i, x, y, val, step, index, last, barSize, fullWidth,
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
    }

    setColor(color, x1, y1, x2, y2) {
        let i, gradient, len,
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
    }

    getColor(start, end, pct) {
        let startColor = {
            r: parseInt(start.substring(1,3), 16),
            g: parseInt(start.substring(3,5), 16),
            b: parseInt(start.substring(5,7), 16)
        };

        let endColor = {
            r: parseInt(end.substring(1,3), 16),
            g: parseInt(end.substring(3,5), 16),
            b: parseInt(end.substring(5,7), 16)
        };

        let c = {
            r: ~~((endColor.r - startColor.r) * pct) + startColor.r,
            g: ~~((endColor.g - startColor.g) * pct) + startColor.g,
            b: ~~((endColor.b - startColor.b) * pct) + startColor.b
        };

        return '#' + c.r.toString(16) + c.g.toString(16) + c.b.toString(16);
    }
}

BarDisplay.label = 'Bars';

BarDisplay.defaults = {
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

module.exports = BarDisplay;
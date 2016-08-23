'use strict';

const Component = require('../core/Component');
const { setColor } = require('../util/canvas');

class CanvasBars extends Component {
    constructor(options, canvas) {
        super(Object.assign({}, CanvasBars.defaults, options));

        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height + this.options.shadowHeight;

        this.context = this.canvas.getContext('2d');
    }

    render(data) {
        let i, x, y, val, step, index, last, barSize, fullWidth,
            bars = data.length,
            canvas = this.canvas,
            context = this.context,
            { height, width, barWidth, barSpacing, color, shadowHeight, shadowColor } = this.options;

        // Reset canvas
        if (canvas.width !== width || canvas.height !== height + shadowHeight) {
            canvas.width = width;
            canvas.height = height + shadowHeight;
        }
        else {
            context.clearRect(0, 0, width, height + shadowHeight);
        }

        // Calculate bar widths
        if (barWidth < 0 && barSpacing < 0) {
            barWidth = barSpacing = (width / bars) / 2;
        }
        else if (barSpacing >= 0 && barWidth < 0) {
            barWidth = (width - (bars * barSpacing)) / bars;
            if (barWidth <= 0) barWidth = 1;
        }
        else if (barWidth > 0 && barSpacing < 0) {
            barSpacing = (width - (bars * barWidth)) / bars;
            if (barSpacing <= 0) barSpacing = 1;
        }

        // Calculate bars to display
        barSize = barWidth + barSpacing;
        fullWidth = barSize * bars;

        // Stepping
        step = (fullWidth > width) ? fullWidth / width : 1;

        // Canvas setup
        setColor(context, color, 0, 0, 0, height);

        // Draw bars
        for (i = 0, x = 0, y = height, last = null; i < bars && x < fullWidth; i += step, x += barSize) {
            index = ~~i;

            if (index !== last) {
                val = data[index] * height;
                last = index;

                context.fillRect(x, y, barWidth, -val);
            }
        }

        // Draw shadow bars
        if (shadowHeight > 0) {
            setColor(context, shadowColor, 0, height, 0, height + shadowHeight);

            for (i = 0, x = 0, y = height, last = null; i < bars && x < fullWidth; i += step, x += barSize) {
                index = ~~i;

                if (index !== last) {
                    val = data[index] * shadowHeight;
                    last = index;

                    context.fillRect(x, y, barWidth, val);
                }
            }
        }
    }
}

CanvasBars.defaults = {
    width: 300,
    height: 100,
    barWidth: -1,
    barSpacing: -1,
    shadowHeight: 100,
    color: '#FFFFFF',
    shadowColor: '#CCCCCC'
};

module.exports = CanvasBars;
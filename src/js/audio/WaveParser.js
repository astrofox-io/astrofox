'use strict';

const { getCurvePoints } = require('cardinal-spline-js');

const Component = require('../core/Component.js');
const { val2pct } = require('../util/math.js');

const defaults = {
    width: 300,
    scrolling: false,
    scrollSpeed: 0.15,
    curve: 0,
    curveRatio: 0.1,
    curveTension: 0.5,
    curveSegments: 25,
    curveClosed: false
};

class WaveParser extends Component {
    constructor(options) {
        super(Object.assign({}, defaults, options));

        this.scrollBuffer = new Float32Array(this.options.width);
    }

    parseTimeData(data, scroll) {
        let i, x, step, size,
            points = [],
            scrollBuffer = this.scrollBuffer,
            {
                width, scrolling, scrollSpeed,
                curve, curveRatio, curveTension, curveSegments, curveClosed
            } = this.options;

        if (scroll) {
            if (scrollBuffer.length !== width) {
                this.scrollBuffer = new Float32Array(width);
            }

            // Parse scrolling data
            size = ~~(width * scrollSpeed * 0.3);
            step = data.length / size;

            // Move all elements down
            for (x = 0; x < width - size; x++) {
                scrollBuffer[x] = scrollBuffer[x + size];
            }

            // Insert new slice
            for (i = 0, x = width - size; x < width; i += step, x++) {
                scrollBuffer[x] = data[~~i];
            }
        }

        // Set data source
        data = (scrolling) ? scrollBuffer : data;

        // Get points
        if (curve > 0) {
            size = ~~(width * curveRatio * curve);
            if (size < 1) size = 1;
            step = data.length / (width / size);

            for (i = 0, x = 0; x < width; i += step, x += size) {
                points.push(x);
                points.push(val2pct(data[~~i], -1, 1));

                // Move last x point to the end
                if (x + size > width) {
                    points[points.length - 2] = width;
                }
            }

            points = getCurvePoints(points, curveTension, curveSegments, curveClosed);
        }
        else {
            step = data.length / width;

            for (i = 0, x = 0; x < width; i += step, x++) {
                points.push(x);
                points.push(val2pct(data[~~i], -1, 1));
            }
        }

        return points;
    }
}

module.exports = WaveParser;
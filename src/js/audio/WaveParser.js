'use strict';

const Component = require('../core/Component.js');

class WaveParser extends Component {
    constructor(options) {
        super(options);

        this.init();
    }

    init() {
        let { width } = this.options;

        this.data = new Float32Array(width);
        this.buffer = new Float32Array(width);
        this.buffer.fill(-1);
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            if (options.width !== undefined) {
                this.init();
            }
        }

        return changed;
    }

    parseTimeData(td) {
        let i, x, size, step,
            { width, height, scrolling, scrollSpeed } = this.options,
            data = this.data,
            buffer = this.buffer;

        if (scrolling) {
            size = ~~(width * scrollSpeed * 0.3);
            step = td.length / size;

            // Move all elements down
            for (x = 0; x < width - size; x++) {
                buffer[x] = buffer[x + size];
            }

            // Insert new slice
            for (i = 0, x = width - size; x < width; i += step, x++) {
                buffer[x] = ((td[~~i] * height) + height) / 2;
            }

            return buffer;
        }
        else {
            step = td.length / width;

            for (i = 0, x = 0; x < width; i += step, x++) {
                data[x] = ((td[~~i] * height) + height) / 2;
            }
        }

        return data;
    }
}

module.exports = WaveParser;
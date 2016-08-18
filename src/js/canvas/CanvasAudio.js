'use strict';

const Component = require('../core/Component.js');
const CanvasBars = require('./CanvasBars.js');

class CanvasAudio extends Component {
    constructor(options, canvas) {
        super(options);

        this.bars = new CanvasBars(options, canvas);
        this.data = new Float32Array(this.options.bars);
    }

    render(data) {
        this.bars.render(this.parseAudioBuffer(data));
    }

    parseAudioBuffer(buffer) {
        let i, j, c, start, end, max, val, values,
            data = this.data,
            size = buffer.length / data.length,
            step = ~~(size / 10) || 1;

        // Process each channel
        for (c = 0; c < buffer.numberOfChannels; c++) {
            values = buffer.getChannelData(c);

            // Process each bar
            for (i = 0; i < data.length; i++) {
                start = ~~(i * size);
                end = ~~(start + size);
                max = 0;

                // Find max value within range
                for (j = start; j < end; j += step) {
                    val = values[j];
                    if (val > max) {
                        max = val;
                    }
                    else if (-val > max) {
                        max = -val;
                    }
                }

                if (c == 0 || max > data[i]) {
                    data[i] = max;
                }
            }
        }

        return data;
    }
}

CanvasAudio.defaults = {
    bars: 100
};

module.exports = CanvasAudio;
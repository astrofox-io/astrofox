'use strict';

const Component = require('../core/Component');
const CanvasBars = require('./CanvasBars');

class CanvasAudio extends Component {
    constructor(options, canvas) {
        super(options);

        this.bars = new CanvasBars(options, canvas);
        this.results = new Float32Array(this.options.bars);
    }

    render(data) {
        this.bars.render(this.parseAudioBuffer(data));
    }

    parseAudioBuffer(buffer) {
        let i, j, c, start, end, max, val, values,
            results = this.results,
            size = buffer.length / results.length,
            step = ~~(size / 10) || 1;

        // Process each channel
        for (c = 0; c < buffer.numberOfChannels; c++) {
            values = buffer.getChannelData(c);

            // Process each bar
            for (i = 0; i < results.length; i++) {
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

                if (c == 0 || max > results[i]) {
                    results[i] = max;
                }
            }
        }

        return results;
    }
}

CanvasAudio.defaults = {
    bars: 100
};

module.exports = CanvasAudio;
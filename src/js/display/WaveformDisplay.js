'use strict';

const BarDisplay = require('../display/BarDisplay.js');
const Display = require('../display/Display.js');

class WaveformDisplay extends BarDisplay {
    constructor(options, canvas) {
        super(Object.assign({}, WaveformDisplay.defaults, options), canvas);

        this.initialized = !!options;
    }

    render(data) {
        super.render(this.parseAudioBuffer(data));
    }

    parseAudioBuffer(buffer) {
        let i, j, c, start, end, max, val, values,
            channels = buffer.numberOfChannels,
            bars = this.options.bars,
            size = buffer.length / bars,
            step = ~~(size / 10) || 1,
            data = new Float32Array(bars);

        // Process each channel
        for (c = 0; c < channels; c++) {
            values = buffer.getChannelData(c);

            // Process each bar
            for (i = 0; i < bars; i++) {
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

WaveformDisplay.label = 'Waveform';

WaveformDisplay.className = 'WaveformDisplay';

WaveformDisplay.defaults = {
    bars: 100
};

module.exports = WaveformDisplay;
'use strict';

const Component = require('../core/Component.js');
const { val2pct, db2mag } = require('../util/math.js');

const defaults = {
    smoothingTimeConstant: 0.5,
    sampleRate: 44100,
    fftSize: 1024,
    minDecibels: -100,
    maxDecibels: 0,
    minFrequency: 0,
    maxFrequency: 22050,
    binSize: 0,
    normalize: false
};

class SpectrumParser extends Component {
    constructor(options) {
        super(Object.assign({}, defaults, options));

        this.init();
    }

    init() {
        let { sampleRate, fftSize, minFrequency, maxFrequency, binSize } = this.options,
            range = sampleRate / fftSize,
            minBin = ~~(minFrequency / range),
            maxBin = ~~(maxFrequency / range),
            bins = binSize || maxBin - minBin;

        if (typeof this.data === 'undefined' || bins !== this.data.length) {
            this.data = new Float32Array(bins);
            this.buffer = new Float32Array(bins);
        }

        this.minBin = minBin;
        this.maxBin = maxBin;
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            this.init();
        }

        return changed;
    }

    getDb(fft, minDb, maxDb, normalize) {
        let db = -100 * (1 - fft/256);

        if (normalize) {
            return val2pct(db2mag(db), db2mag(minDb), db2mag(maxDb));
        }
        else {
            return val2pct(db, -100, maxDb);
        }
    }

    parseFFT(fft) {
        let i, j, k, size, step, start, end, val, max,
            data = this.data,
            buffer = this.buffer,
            minBin = this.minBin,
            maxBin = this.maxBin,
            bins = data.length,
            totalBins = maxBin - minBin,
            { minDecibels, maxDecibels, normalize, smoothingTimeConstant } = this.options;

        // Convert values
        if (bins === totalBins) {
            for (i = minBin; i < maxBin; i++) {
                data[i] = this.getDb(fft[i], minDecibels, maxDecibels, normalize);
            }
        }
        // Compress data
        else if (bins < totalBins) {
            size = totalBins / bins;
            step = ~~(size / 10) || 1;

            for (i = minBin; i < maxBin; i++) {
                start = ~~(i * size);
                end = ~~(start + size);
                max = 0;

                // Find max value within range
                for (j = start; j < end; j += step) {
                    val = fft[j];
                    if (val > max) {
                        max = val;
                    }
                    else if (-val > max) {
                        max = -val;
                    }
                }

                data[i] = this.getDb(max, minDecibels, maxDecibels, normalize);
            }
        }
        // Expand data
        else if (bins > totalBins) {
            size = bins / totalBins;

            for (i = minBin, j = 0; i < maxBin; i++, j++) {
                val = this.getDb(fft[i], minDecibels, maxDecibels, normalize);
                start = ~~(j * size);
                end = start + size;

                for (k = start; k < end; k += 1) {
                    data[k] = val;
                }
            }
        }

        // Apply smoothing
        if (smoothingTimeConstant > 0) {
            for (i = 0; i < bins; i++) {
                data[i] = (buffer[i] * smoothingTimeConstant) + (data[i] * (1.0 - smoothingTimeConstant));
                buffer[i] = data[i];
            }
        }

        return data;
    }
}

module.exports = SpectrumParser;
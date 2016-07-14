'use strict';

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

class SpectrumParser {
    constructor(options) {
        this.options = Object.assign({}, defaults, options);

        this.init();
    }

    init() {
        let options = this.options,
            range = options.sampleRate / options.fftSize,
            minBin = ~~(options.minFrequency / range),
            maxBin = ~~(options.maxFrequency / range),
            bins = options.binSize || maxBin - minBin;

        if (typeof this.fft === 'undefined' || bins !== this.fft.length) {
            this.fft = new Float32Array(bins);
            this.last = new Float32Array(bins);
        }

        this.minBin = minBin;
        this.maxBin = maxBin;
    }

    update(options) {
        if (typeof options === 'object') {
            let changed = false;

            Object.keys(options).forEach(prop => {
                if (this.options.hasOwnProperty(prop) && this.options[prop] !== options[prop]) {
                    this.options[prop] = options[prop];
                    changed = true;
                }
            }, this);

            if (changed) this.init();
        }
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
            options = this.options,
            data = this.fft,
            last = this.last,
            minBin = this.minBin,
            maxBin = this.maxBin,
            minDb = options.minDecibels,
            maxDb = options.maxDecibels,
            normalize = options.normalize,
            smoothing = options.smoothingTimeConstant,
            bins = data.length,
            totalBins = maxBin - minBin;

        // Convert values
        if (bins === totalBins) {
            for (i = minBin; i < maxBin; i++) {
                data[i] = this.getDb(fft[i], minDb, maxDb, normalize);
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

                data[i] = this.getDb(max, minDb, maxDb, normalize);
            }
        }
        // Expand data
        else if (bins > totalBins) {
            size = bins / totalBins;

            for (i = minBin, j = 0; i < maxBin; i++, j++) {
                val = this.getDb(fft[i], minDb, maxDb, normalize);
                start = ~~(j * size);
                end = start + size;

                for (k = start; k < end; k += 1) {
                    data[k] = val;
                }
            }
        }

        // Apply smoothing
        if (smoothing > 0) {
            for (i = 0; i < bins; i++) {
                data[i] = (last[i] * smoothing) + (data[i] * (1.0 - smoothing));
                last[i] = data[i];
            }
        }

        return data;
    }
}

module.exports = SpectrumParser;
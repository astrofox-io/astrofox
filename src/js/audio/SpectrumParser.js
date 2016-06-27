'use strict';

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
        if (options) {
            let changed = false;

            for (let prop in options) {
                if (options.hasOwnProperty(prop) && this.options.hasOwnProperty(prop)) {
                    if (this.options[prop] !== options[prop]) {
                        this.options[prop] = options[prop];
                        changed = true;
                    }
                }
            }

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

function val2pct(val, min, max) {
    if (val > max) val = max;
    return (val - min) / (max - min);
}

function round(val) {
    return (val + 0.5) << 0;
}

function ceil(val) {
    var n = (val << 0);
    return (n == val) ? n : n + 1;
}

function db2mag(val) {
    // Math.pow(10, 0.05 * val);
    return Math.exp(0.1151292546497023 * val);
}

function mag2db(val) {
    // 20 * log10(db)
    return 20 * log10(val);
}

function log10(val) {
    return Math.log(val) / Math.LN10;
}

module.exports = SpectrumParser;
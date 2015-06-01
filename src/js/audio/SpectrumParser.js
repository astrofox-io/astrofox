'use strict';

var SpectrumParser = {
    parseFFT: function(fft, options, last) {
        var i, j, size, step, tmp, start, end, val, max,
            sampleRate = options.sampleRate || 44100,
            fftSize = options.fftSize || 1024,
            range = sampleRate / fftSize,
            minDb = options.minDecibels || -100,
            maxDb = options.maxDecibels || 0,
            minHz = options.minFrequency || 0,
            maxHz = options.maxFrequency || sampleRate/2,
            minVal = db2mag(minDb),
            maxVal = db2mag(maxDb),
            minBin = ~~(minHz / range),
            maxBin = ~~(maxHz / range),
            bins = options.binSize || maxBin,
            smoothing = (last && last.length === bins) ? options.smoothingTimeConstant : 0,
            data = new Float32Array(maxBin);

        // Convert db to magnitude
        for (i = minBin; i < maxBin; i++) {
            data[i] = convertDb(fft[i], minVal, maxVal);
        }

        if (bins !== maxBin && bins > 0) {
            tmp = new Float32Array(bins);

            // Compress data
            if (bins < maxBin) {
                size = maxBin / bins;
                step = ~~(size / 10) || 1;

                for (i = 0; i < bins; i++) {
                    start = ~~(i * size);
                    end = ~~(start + size);
                    max = 0;

                    // Find max value within range
                    for (j = start; j < end; j += step) {
                        val = data[j];
                        if (val > max) {
                            max = val;
                        }
                        else if (-val > max) {
                            max = -val;
                        }
                    }

                    tmp[i] = max;
                }

                data = tmp;
            }
            // Expand data
            else if (bins > maxBin) {
                size = bins / maxBin;

                for (i = 0; i < maxBin; i++) {
                    start = ~~(i * size);
                    end = ~~(start + size);

                    for (j = start; j < end; j += 1) {
                        tmp[j] = data[i];
                    }
                }

                data = tmp;
            }
        }

        // Apply smoothing
        if (smoothing > 0) {
            for (i = 0; i < bins; i++) {
                data[i] = (last[i] * smoothing) + (data[i] * (1.0 - smoothing));
            }
        }

        return data;
    }
};

function convertDb(db, min, max) {
    var val = db2mag(db);
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
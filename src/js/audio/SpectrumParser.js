import Component from 'core/Component';
import { val2pct, db2mag } from 'util/math';
import { fftSize, sampleRate } from 'config/system.json';

export default class SpectrumParser extends Component {
    constructor(options) {
        super(Object.assign({}, SpectrumParser.defaults, options));

        this.setBinRange();
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            this.setBinRange();
        }

        return changed;
    }

    setBinRange() {
        let { sampleRate, fftSize, minFrequency, maxFrequency } = this.options,
            range = sampleRate / fftSize;

        this.minBin = ~~(minFrequency / range);
        this.maxBin = ~~(maxFrequency / range);
        this.totalBins = this.maxBin - this.minBin;
    }

    getDb(fft) {
        let db = -100 * (1 - fft/256),
            { minDecibels, maxDecibels, normalize } = this.options;

        if (normalize) {
            return val2pct(db2mag(db), db2mag(minDecibels), db2mag(maxDecibels));
        }

        return val2pct(db, -100, maxDecibels);
    }

    parseFFT(fft) {
        let i, j, k, size, step, start, end, val, max,
            { results, buffer, minBin, maxBin, totalBins } = this,
            { smoothingTimeConstant, bins } = this.options;

        bins = bins || totalBins;

        // Resize data arrays
        if (results === undefined || results.length !== bins) {
            results = this.results = new Float32Array(bins);
            buffer = this.buffer = new Float32Array(bins);
        }

        // Convert values
        if (bins === totalBins) {
            for (i = minBin, k = 0; i < maxBin; i++, k++) {
                results[k] = this.getDb(fft[i]);
            }
        }
        // Compress data
        else if (bins < totalBins) {
            size = totalBins / bins;
            step = ~~(size / 10) || 1;

            for (i = minBin, k = 0; i < maxBin; i++, k++) {
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

                results[k] = this.getDb(max);
            }
        }
        // Expand data
        else if (bins > totalBins) {
            size = bins / totalBins;

            for (i = minBin, j = 0; i < maxBin; i++, j++) {
                val = this.getDb(fft[i]);
                start = ~~(j * size);
                end = start + size;

                for (k = start; k < end; k += 1) {
                    results[k] = val;
                }
            }
        }

        // Apply smoothing
        if (smoothingTimeConstant > 0) {
            for (i = 0; i < bins; i++) {
                results[i] = (buffer[i] * smoothingTimeConstant) + (results[i] * (1.0 - smoothingTimeConstant));
                buffer[i] = results[i];
            }
        }

        return results;
    }
}

SpectrumParser.defaults = {
    fftSize: fftSize,
    sampleRate: sampleRate,
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: 0,
    minFrequency: 0,
    maxFrequency: sampleRate / 2,
    normalize: false,
    bins: 0
};
import Component from 'core/Component';
import { val2pct, db2mag } from 'utils/math';
import { fftSize, sampleRate } from 'config/system.json';

export default class SpectrumParser extends Component {
    constructor(options) {
        super(Object.assign({}, SpectrumParser.defaults, options));

        this.setBinRange();
    }

    setBinRange() {
        const {
            minFrequency,
            maxFrequency,
        } = this.options;

        const range = sampleRate / fftSize;

        this.minBin = ~~(minFrequency / range);
        this.maxBin = ~~(maxFrequency / range);
        this.totalBins = this.maxBin - this.minBin;
    }

    getDb(fft) {
        const { minDecibels, maxDecibels, normalize } = this.options;
        const db = -100 * (1 - (fft / 256));

        if (normalize) {
            return val2pct(db2mag(db), db2mag(minDecibels), db2mag(maxDecibels));
        }

        return val2pct(db, -100, maxDecibels);
    }

    update(options) {
        const changed = super.update(options);

        if (changed) {
            this.setBinRange();
        }

        return changed;
    }

    parseFFT(fft) {
        let {
            results,
            buffer,
        } = this;
        const {
            minBin,
            maxBin,
            totalBins,
        } = this;
        const { smoothingTimeConstant, bins } = this.options;
        const n = bins || totalBins;

        // Resize data arrays
        if (results === undefined || results.length !== n) {
            results = new Float32Array(n);
            buffer = new Float32Array(n);
            this.results = results;
            this.buffer = buffer;
        }

        // Convert values
        if (n === totalBins) {
            for (let i = minBin, k = 0; i < maxBin; i += 1, k += 1) {
                results[k] = this.getDb(fft[i]);
            }
        }
        // Compress data
        else if (n < totalBins) {
            const size = totalBins / n;
            const step = ~~(size / 10) || 1;

            for (let i = minBin, k = 0; i < maxBin; i += 1, k += 1) {
                const start = ~~(i * size);
                const end = ~~(start + size);
                let max = 0;

                // Find max value within range
                for (let j = start; j < end; j += step) {
                    const val = fft[j];

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
        else if (n > totalBins) {
            const size = n / totalBins;

            for (let i = minBin, j = 0; i < maxBin; i += 1, j += 1) {
                const val = this.getDb(fft[i]);
                const start = ~~(j * size);
                const end = start + size;

                for (let k = start; k < end; k += 1) {
                    results[k] = val;
                }
            }
        }

        // Apply smoothing
        if (smoothingTimeConstant > 0) {
            for (let i = 0; i < n; i += 1) {
                results[i] = (
                    buffer[i] * smoothingTimeConstant) +
                    (results[i] * (1.0 - smoothingTimeConstant));

                buffer[i] = results[i];
            }
        }

        return results;
    }
}

SpectrumParser.defaults = {
    fftSize,
    sampleRate,
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: 0,
    minFrequency: 0,
    maxFrequency: sampleRate / 2,
    normalize: false,
    bins: 0,
};

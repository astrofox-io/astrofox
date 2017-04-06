import Component from '../core/Component';
import { val2pct, db2mag } from '../util/math';

const defaults = {
    smoothingTimeConstant: 0.5,
    sampleRate: 44100,
    fftSize: 1024,
    minDecibels: -100,
    maxDecibels: 0,
    minFrequency: 0,
    maxFrequency: 22050,
    normalize: false
};

export default class SpectrumParser extends Component {
    constructor(options) {
        super(Object.assign({}, defaults, options));
    }

    getDb(fft) {
        let db = -100 * (1 - fft/256),
            { minDecibels, maxDecibels, normalize } = this.options;

        if (normalize) {
            return val2pct(db2mag(db), db2mag(minDecibels), db2mag(maxDecibels));
        }

        return val2pct(db, -100, maxDecibels);
    }

    getBinRange() {
        let { sampleRate, fftSize, minFrequency, maxFrequency } = this.options,
            range = sampleRate / fftSize,
            minBin = ~~(minFrequency / range),
            maxBin = ~~(maxFrequency / range),
            totalBins = maxBin - minBin;

        return { minBin, maxBin, totalBins };
    }

    parseFFT(fft, bins) {
        let i, j, k, size, step, start, end, val, max,
            results = this.results,
            buffer = this.buffer,
            { smoothingTimeConstant } = this.options,
            { minBin, maxBin, totalBins } = this.getBinRange();

        bins = bins || totalBins;

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
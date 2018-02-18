import Component from 'core/Component';
import { val2pct, db2mag } from 'utils/math';
import audioConfig from 'config/audio.json';

const { fftSize, sampleRate } = audioConfig;

export default class SpectrumParser extends Component {
    static defaults = {
        fftSize,
        sampleRate,
        smoothingTimeConstant: 0.5,
        minDecibels: -100,
        maxDecibels: 0,
        minFrequency: 0,
        maxFrequency: sampleRate / 2,
        normalize: false,
        bins: 0,
    }

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
            output,
            buffer,
        } = this;

        const {
            minBin,
            maxBin,
            totalBins,
        } = this;

        const { smoothingTimeConstant, bins } = this.options;
        const size = bins || totalBins;

        // Resize data arrays
        if (output === undefined || output.length !== size) {
            output = new Float32Array(size);
            buffer = new Float32Array(size);
            this.output = output;
            this.buffer = buffer;
        }

        // Straight conversion
        if (size === totalBins) {
            for (let i = minBin, k = 0; i < maxBin; i += 1, k += 1) {
                output[k] = this.getDb(fft[i]);
            }
        }
        // Compress data
        else if (size < totalBins) {
            const step = totalBins / size;

            for (let i = minBin, k = 0; i < maxBin; i += 1, k += 1) {
                const start = ~~(i * step);
                const end = ~~(start + step);
                let max = 0;

                // Find max value within range
                for (let j = start, n = ~~(step / 10) || 1; j < end; j += n) {
                    const val = fft[j];

                    if (val > max) {
                        max = val;
                    }
                    else if (-val > max) {
                        max = -val;
                    }
                }

                output[k] = this.getDb(max);
            }
        }
        // Expand data
        else if (size > totalBins) {
            const step = size / totalBins;

            for (let i = minBin, j = 0; i < maxBin; i += 1, j += 1) {
                const val = this.getDb(fft[i]);
                const start = ~~(j * step);
                const end = start + step;

                for (let k = start; k < end; k += 1) {
                    output[k] = val;
                }
            }
        }

        // Apply smoothing
        if (smoothingTimeConstant > 0) {
            for (let i = 0; i < size; i += 1) {
                output[i] = (
                    buffer[i] * smoothingTimeConstant) +
                    (output[i] * (1.0 - smoothingTimeConstant));

                buffer[i] = output[i];
            }
        }

        return output;
    }
}

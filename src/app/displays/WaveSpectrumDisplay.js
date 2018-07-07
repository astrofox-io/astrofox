import CanvasDisplay from 'core/CanvasDisplay';
import CanvasWave from 'canvas/CanvasWave';
import SpectrumParser from 'audio/SpectrumParser';
import audioConfig from 'config/audio.json';

const { fftSize, sampleRate } = audioConfig;

export default class WaveSpectrumDisplay extends CanvasDisplay {
    static label = 'Wave Spectrum';

    static className = 'WaveSpectrumDisplay';

    static defaultOptions = {
        width: 770,
        height: 240,
        x: 0,
        y: 0,
        stroke: true,
        color: '#FFFFFF',
        fill: true,
        fillColor: ['#C0C0C0', '#000000'],
        taper: true,
        rotation: 0,
        opacity: 1.0,
        fftSize,
        sampleRate,
        smoothingTimeConstant: 0.5,
        minDecibels: -100,
        maxDecibels: -20,
        minFrequency: 0,
        maxFrequency: 2000,
        normalize: true,
    }

    constructor(options) {
        super(WaveSpectrumDisplay, options);

        this.wave = new CanvasWave(this.options, this.canvas);
        this.parser = new SpectrumParser(this.options);
    }

    update(options) {
        const changed = super.update(options);

        if (changed) {
            this.wave.update(options);
            this.parser.update(options);
        }

        return changed;
    }

    getPoints(fft) {
        const { width } = this.options;
        const points = [];

        for (let i = 0, j = 0, k = 0; i < fft.length; i += 1) {
            j = fft[i];

            if (i === 0 || i === fft.length - 1 || k !== (j > fft[i - 1]) ? 1 : -1) {
                points.push(i * (width / fft.length));
                points.push(j);
            }

            k = (j > fft[i - 1]) ? 1 : -1;
        }

        points[points.length - 2] = width;

        return points;
    }

    renderToScene(scene, data) {
        const {
            wave,
            parser,
            canvas: {
                width,
                height,
            },
        } = this;
        const fft = parser.parseFFT(data.fft);

        wave.render(this.getPoints(fft), true);

        this.renderToCanvas(
            scene.getContext('2d'),
            width / 2,
            height,
        );
    }
}

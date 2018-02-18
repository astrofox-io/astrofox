import CanvasDisplay from 'core/CanvasDisplay';
import CanvasBars from 'canvas/CanvasBars';
import SpectrumParser from 'audio/SpectrumParser';
import { fftSize, sampleRate } from 'config/audio.json';

export default class BarSpectrumDisplay extends CanvasDisplay {
    static label = 'Bar Spectrum';

    static className = 'BarSpectrumDisplay';

    static defaults = {
        width: 770,
        height: 240,
        x: 0,
        y: 0,
        barWidth: -1,
        barSpacing: -1,
        barWidthAutoSize: 1,
        barSpacingAutoSize: 1,
        shadowHeight: 100,
        color: ['#FFFFFF', '#FFFFFF'],
        shadowColor: ['#333333', '#000000'],
        rotation: 0,
        opacity: 1.0,
        fftSize,
        sampleRate,
        smoothingTimeConstant: 0.5,
        minDecibels: -100,
        maxDecibels: -12,
        minFrequency: 0,
        maxFrequency: 6000,
        normalize: true,
    }

    constructor(options) {
        super(BarSpectrumDisplay, options);

        this.bars = new CanvasBars(this.options, this.canvas);
        this.parser = new SpectrumParser(Object.assign(this.options, { fftSize, sampleRate }));
    }

    update(options) {
        const changed = super.update(options);

        if (changed) {
            this.bars.update(options);
            this.parser.update(options);
        }

        return changed;
    }

    renderToScene(scene, data) {
        const fft = this.parser.parseFFT(data.fft);

        this.bars.render(fft);

        this.renderToCanvas(
            scene.getContext('2d'),
            this.canvas.width / 2,
            this.options.height,
        );
    }
}

import CanvasDisplay from 'core/CanvasDisplay';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from 'app/constants';

export default class SoundwaveDisplay extends CanvasDisplay {
    static label = 'Soundwave';

    static className = 'SoundwaveDisplay';

    static defaultOptions = {
        color: '#FFFFFF',
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT / 2,
        lineWidth: 1.0,
        wavelength: 0,
        smooth: false,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1.0,
    }

    constructor(options) {
        super(SoundwaveDisplay, options);

        this.wave = new CanvasWave(this.options, this.canvas);
        this.parser = new WaveParser();
    }

    update(options) {
        const changed = super.update(options);

        if (changed) {
            this.wave.update(options);
        }

        return changed;
    }

    renderToScene(scene, data) {
        const {
            wave,
            parser,
            canvas: {
                width,
                height,
            },
            options: {
                smooth,
                wavelength,
            },
        } = this;

        const points = parser.parseTimeData(data.td, wavelength > 0 ? width / wavelength : width);

        wave.render(points, wavelength > 3 ? smooth : false);

        this.renderToCanvas(
            scene.getContext('2d'),
            width / 2,
            height / 2,
        );
    }
}

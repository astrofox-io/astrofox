import CanvasDisplay from 'core/CanvasDisplay';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';

export default class SoundwaveDisplay extends CanvasDisplay {
    static label = 'Soundwave';

    static className = 'SoundwaveDisplay';

    static defaults = {
        color: '#FFFFFF',
        width: 854,
        height: 240,
        lineWidth: 1.0,
        length: 0,
        smooth: false,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1.0,
    }

    constructor(options) {
        super(SoundwaveDisplay, options);

        this.wave = new CanvasWave(this.options, this.canvas);
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
            canvas: {
                width,
                height,
            },
            options: {
                smooth,
                length,
            },
        } = this;
        const points = WaveParser.parseTimeData(data.td, width, length);

        wave.render(points, length > 3 ? smooth : false);

        this.renderToCanvas(
            scene.getContext('2d'),
            width / 2,
            height / 2,
        );
    }
}

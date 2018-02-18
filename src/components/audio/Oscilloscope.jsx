import React, { PureComponent } from 'react';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';
import styles from './Oscilloscope.less';

export default class Oscilloscope extends PureComponent {
    static defaultProps = {
        width: 854,
        height: 50,
        color: '#927FFF',
    }

    componentDidMount() {
        this.display = new CanvasWave(
            this.props,
            this.canvas,
        );

        this.parser = new WaveParser();
    }

    draw = ({ td }) => {
        const { display, parser } = this;
        const { width } = this.props;

        display.render(parser.parseTimeData(td, width));
    }

    render() {
        const { width, height } = this.props;

        return (
            <div className={styles.oscilloscope}>
                <canvas
                    ref={e => (this.canvas = e)}
                    className={styles.canvas}
                    width={width}
                    height={height}
                />
            </div>
        );
    }
}

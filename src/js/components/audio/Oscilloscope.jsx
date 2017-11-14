import React from 'react';

import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';

export default class Oscilloscope extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.display = new CanvasWave(
            this.props,
            this.canvas
        );
    }

    draw = (data) => {
        const points = WaveParser.parseTimeData(data.td, this.props.width, 0);

        this.display.render(points);
    };

    render() {
        const { width, height } = this.props;

        return (
            <div className="oscilloscope">
                <canvas
                    ref={e => this.canvas = e}
                    className="canvas"
                    width={width}
                    height={height}
                />
            </div>
        );
    }
}

Oscilloscope.defaultProps = {
    width: 854,
    height: 50,
    color: '#927FFF'
};
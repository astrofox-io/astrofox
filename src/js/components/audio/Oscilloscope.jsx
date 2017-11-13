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

    draw(data) {
        let points = WaveParser.parseTimeData(data.td, this.props.width, 0);

        this.display.render(points);
    }

    render() {
        return (
            <div className="oscilloscope">
                <canvas
                    ref={el => this.canvas = el}
                    className="canvas"
                    width={this.props.width}
                    height={this.props.height}
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
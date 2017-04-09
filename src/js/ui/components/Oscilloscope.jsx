import React from 'react';

import UIComponent from '../UIComponent';
import { events } from '../../core/Global';
import CanvasWave from '../../canvas/CanvasWave';
import WaveParser from '../../audio/WaveParser';

export default class Oscilloscope extends UIComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.display = new CanvasWave(
            this.props,
            this.canvas
        );

        events.on('render', this.updateCanvas, this);
    }

    componentWillUnmount() {
        events.off('render', this.updateCanvas, this);
    }

    updateCanvas(data) {
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
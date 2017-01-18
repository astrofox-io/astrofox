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
            this.refs.canvas
        );

        events.on('render', this.updateCanvas);
    }

    componentWillUnmount() {
        events.off('render', this.updateCanvas);
    }

    shouldComponentUpdate() {
        return false;
    }

    updateCanvas(data) {
        let points = WaveParser.parseTimeData(data.td, 854, 0);

        this.display.render(points);
    }

    render() {
        return (
            <div className="oscilloscope">
                <canvas ref="canvas" width="854" height="100" />
            </div>
        );
    }
}

Oscilloscope.defaultProps = {
    width: 854,
    height: 100,
    color: '#927FFF'
};
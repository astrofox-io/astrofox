'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const UIComponent = require('../UIComponent.js');
const { Events } = require('../../core/Global.js');
const CanvasWave = require('../../canvas/CanvasWave.js');
const WaveParser = require('../../audio/WaveParser.js');

class Oscilloscope extends UIComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.display = new CanvasWave(
            this.props,
            this.refs.canvas
        );

        Events.on('render', this.updateCanvas);
    }

    componentWillUnmount() {
        Events.off('render', this.updateCanvas);
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

module.exports = Oscilloscope;
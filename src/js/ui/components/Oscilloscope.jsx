'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const { Events } = require('../../core/Global.js');
const Wave = require('../../canvas/Wave.js');
const autoBind = require('../../util/autoBind.js');

class Oscilloscope extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.display = new Wave(
            this.props,
            this.refs.canvas
        );

        Events.on('render', this.updateCanvas);
    }

    componentWillUnmount(data) {
        Events.off('render', this.updateCanvas);
    }

    shouldComponentUpdate() {
        return false;
    }

    updateCanvas(data) {
        this.display.render(data.td, data.playing);
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
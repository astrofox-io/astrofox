'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const { Events } = require('../../core/Global.js');
const WaveDisplay = require('../../display/WaveDisplay.js');

const config = {
    width: 854,
    height: 100,
    color: '#927FFF'
};

class Oscilloscope extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.display = new WaveDisplay(
            ReactDOM.findDOMNode(this.refs.canvas),
            config
        );

        Events.on('render', data => {
            this.display.render(data.td, data.playing);
        }, this);
    }

    render() {
        return (
            <div className="oscilloscope">
                <canvas ref="canvas" className="canvas" width="854" height="100" />
            </div>
        );
    }
}

module.exports = Oscilloscope;
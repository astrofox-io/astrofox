'use strict';

var React = require('react');
var Application = require('core/Application.js');
var OscilloscopeDisplay = require('display/OscilloscopeDisplay.js');

var Oscilloscope = React.createClass({
    config: {
        width: 854,
        height: 100,
        color: '#927FFF'
    },

    componentDidMount: function() {
        this.display = new OscilloscopeDisplay(
            React.findDOMNode(this.refs.canvas),
            this.config
        );

        Application.on('render', function() {
            var data = Application.spectrum.getTimeData();

            this.display.render(data);
        }, this);
    },

    render: function() {
        return (
            <div className="oscilloscope">
                <canvas ref="canvas" className="canvas" width="854" height="100" />
            </div>
        );
    }
});

module.exports = Oscilloscope;
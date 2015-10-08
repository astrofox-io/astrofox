'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Application = require('core/Application.js');
var WaveDisplay = require('display/WaveDisplay.js');

var Wave = React.createClass({
    config: {
        width: 854,
        height: 100,
        color: '#927FFF'
    },

    componentDidMount: function() {
        this.display = new WaveDisplay(
            ReactDOM.findDOMNode(this.refs.canvas),
            this.config
        );

        Application.on('render', function(data) {
            this.display.render(data.td);
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

module.exports = Wave;
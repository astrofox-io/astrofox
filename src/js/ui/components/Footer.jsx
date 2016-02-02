'use strict';

var React = require('react');
var Application = require('../../core/Application.js');

var Footer = React.createClass({
    getInitialState: function() {
        return {
            stats: {
                fps: 0
            }
        };
    },

    componentDidMount: function() {
        Application.stage.on('tick', function(stats) {
            this.setState({ stats: stats });
        }, this);
    },

    render: function() {
        return (
            <div id="footer">
                <div className="filename flex">{this.props.filename}</div>
                <div className="fps">{this.state.stats.fps} FPS</div>
                <div className="version">v1.0</div>
            </div>
        );
    }
});

module.exports = Footer;
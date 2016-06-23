'use strict';

var React = require('react');
var Application = require('../../core/Application.js');

var Footer = React.createClass({
    getInitialState: function() {
        return {
            fps: 0
        };
    },

    componentDidMount: function() {
        Application.on('tick', function(stats) {
            this.setState({ fps: stats.fps });
        }, this);
    },

    render: function() {
        return (
            <div id="footer">
                <div className="filename flex">{this.props.filename}</div>
                <div className="fps">{this.state.fps} FPS</div>
                <div className="version">v{process.versions.electron}</div>
            </div>
        );
    }
});

module.exports = Footer;
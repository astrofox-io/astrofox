'use strict';

var React = require('react');

var Footer = React.createClass({
    render: function() {
        return (
            <div id="footer">
                <div className="filename flex">{this.props.filename}</div>
                <div className="version">v1.0</div>
            </div>
        );
    }
});

module.exports = Footer;
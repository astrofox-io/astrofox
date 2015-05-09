'use strict';

var React = require('react');
var ModalWindow = require('./ModalWindow.jsx');

var AboutWindow = React.createClass({
    render: function() {
        return (
            <ModalWindow title="ABOUT" onClose={this.props.onClose}>
                AstroFox version 1.0
            </ModalWindow>
        );
    }
});

module.exports = AboutWindow;
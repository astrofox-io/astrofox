'use strict';

var React = require('react');
var ModalWindow = require('./ModalWindow.jsx');

var SettingsWindow = React.createClass({
    render: function() {
        return (
            <ModalWindow title="SETTINGS" onClose={this.props.onClose}>
                <div className="settings">
                    <h1>Canvas Size</h1>
                    <div>
                        <div>16:9</div>
                        <div>4:3</div>
                        <div>1:1</div>
                    </div>
                </div>
            </ModalWindow>
        );
    }
});

module.exports = SettingsWindow;
'use strict';

var React = require('react');
var ModalWindow = require('./ModalWindow.jsx');
var MenuPanel = require('../panels/MenuPanel.jsx');

var SettingsWindow = React.createClass({
    render: function() {
        return (
            <ModalWindow title="SETTINGS" onClose={this.props.onClose}>
                <MenuPanel tabs={['one','two','three']}>
                    <div>ONE</div>
                    <div>TWO</div>
                    <div>THREE</div>
                </MenuPanel>
            </ModalWindow>
        );
    }
});

module.exports = SettingsWindow;
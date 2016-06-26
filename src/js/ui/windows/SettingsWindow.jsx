'use strict';

const React = require('react');
const ModalWindow = require('./ModalWindow.jsx');
const MenuPanel = require('../components/MenuPanel.jsx');

const SettingsWindow = function(props) {
    return (
        <ModalWindow title="SETTINGS" onClose={props.onClose}>
            <MenuPanel tabs={['one','two','three']}>
                <div>ONE</div>
                <div>TWO</div>
                <div>THREE</div>
            </MenuPanel>
        </ModalWindow>
    );
};

module.exports = SettingsWindow;
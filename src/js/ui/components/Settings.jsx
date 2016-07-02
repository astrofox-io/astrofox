'use strict';

const React = require('react');
const MenuPanel = require('./MenuPanel.jsx');

const Settings = function(props) {
    return (
        <div className="settings">
            <MenuPanel tabs={['one','two','three']}>
                <div>ONE</div>
                <div>TWO</div>
                <div>THREE</div>
            </MenuPanel>
        </div>
    );
};

module.exports = Settings;
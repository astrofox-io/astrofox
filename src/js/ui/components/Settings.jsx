'use strict';

const React = require('react');
const autoBind = require('../../util/autoBind.js');

const TabPanel = require('./TabPanel.jsx');

const menuItems = [
    'General',
    'Interface',
    'Advanced'
];

class Settings extends React.Component {
    constructor(props) {
        super(props);

        autoBind(this);
    }

    render() {
        return (
            <TabPanel tabs={menuItems} tabPosition="left">
                <div>
                    ONE
                </div>
                <div>
                    TWO
                </div>
                <div>
                    THREE
                </div>
            </TabPanel>
        );
    }
}

module.exports = Settings;
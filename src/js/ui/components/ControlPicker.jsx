import React from 'react';

import UIComponent from '../UIComponent';
import { events } from '../../core/Global';
import { TabPanel, Tab } from '../layout/TabPanel';
import * as displayLibrary from '../../lib/displays';
import * as effectsLibrary from '../../lib/effects';

export default class ControlPicker extends UIComponent {
    constructor(props) {
        super(props);
    }

    onClick(item) {
        events.emit('control-picked', item);

        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    render() {
        let displays = Object.keys(displayLibrary).map((key, index) => {
            let display = displayLibrary[key];

            return (
                <div key={index} className="item">
                    <div className="image" onClick={this.onClick.bind(null, display)}></div>
                    <div className="name">{display.label}</div>
                </div>
            );
        });

        let effects = Object.keys(effectsLibrary).map((key, index) => {
            let effect = effectsLibrary[key];

            return (
                <div key={index} className="item">
                    <div className="image" onClick={this.onClick.bind(null, effect)}></div>
                    <div className="name">{effect.label}</div>
                </div>
            );
        });

        return (
            <div id="control-picker" className="picker-panel">
                <TabPanel tabPosition="left" activeIndex={this.props.activeIndex}>
                    <Tab name="Displays" contentClassName="picker">
                        {displays}
                    </Tab>
                    <Tab name="Effects" contentClassName="picker">
                        {effects}
                    </Tab>
                </TabPanel>
            </div>
        );
    }
};
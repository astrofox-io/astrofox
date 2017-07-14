import React from 'react';

import UIComponent from '../UIComponent';
import { TabPanel, Tab } from '../layout/TabPanel';
import * as displayLibrary from '../../lib/displays';
import * as effectsLibrary from '../../lib/effects';
import { styleProps } from '../../util/react';

export default class ControlPicker extends UIComponent {
    constructor(props) {
        super(props);
    }

    onClick(item) {
        if (this.props.onControlPicked) {
            this.props.onControlPicked(new item());
        }

        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    getItems(items) {
        return Object.keys(items).map((key, index) => {
            let item = items[key],
                style = { backgroundImage: `url(./images/controls/${item.name}.png)` };

            return (
                <div key={index} className="item">
                    <div
                        className="image"
                        onClick={this.onClick.bind(null, item)}
                        style={style}
                    />
                    <div className="name">{item.label}</div>
                </div>
            );
        });
    }

    render() {
        let props = this.props,
            displays = this.getItems(displayLibrary),
            effects = this.getItems(effectsLibrary);

        return (
            <div className="picker-panel" style={styleProps(props)}>
                <TabPanel tabPosition="left" activeIndex={props.activeIndex}>
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
}
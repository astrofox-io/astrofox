import React from 'react';

import { TabPanel, Tab } from 'components/layout/TabPanel';
import * as displayLibrary from 'lib/displays';
import * as effectsLibrary from 'lib/effects';
import { styleProps } from 'utils/react';

export default class ControlPicker extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick = (item) => {
        return () => {
            const { onControlPicked, onClose } = this.props;

            if (onControlPicked) {
                onControlPicked(new item());
            }

            if (onClose) {
                onClose();
            }
        };
    };

    getItems(items) {
        return Object.keys(items).map((key, index) => {
            let item = items[key],
                style = { backgroundImage: `url(./images/controls/${item.className}.png)` };

            return (
                <div key={index} className="item">
                    <div
                        className="image"
                        onClick={this.onClick(item)}
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
import React from 'react';
import { TabPanel, Tab } from 'components/layout/TabPanel';
import * as displayLibrary from 'lib/displays';
import * as effectsLibrary from 'lib/effects';
import styles from './ControlPicker.less';

export default class ControlPicker extends React.Component {
    onClick = Item => () => {
        const { onControlPicked, onClose } = this.props;

        if (onControlPicked) {
            onControlPicked(new Item());
        }

        if (onClose) {
            onClose();
        }
    }

    getItems(items) {
        return Object.keys(items).map((key, index) => {
            const item = items[key];
            const style = { backgroundImage: `url(./images/controls/${item.className}.png)` };

            return (
                <div key={index} className={styles.item}>
                    <div
                        className={styles.image}
                        onClick={this.onClick(item)}
                        style={style}
                    />
                    <div className={styles.name}>
                        {item.label}
                    </div>
                </div>
            );
        });
    }

    render() {
        const { activeIndex } = this.props;
        const displays = this.getItems(displayLibrary);
        const effects = this.getItems(effectsLibrary);

        return (
            <div>
                <TabPanel className={styles.panel} tabPosition="left" activeIndex={activeIndex}>
                    <Tab name="Displays" contentClassName={styles.picker}>
                        {displays}
                    </Tab>
                    <Tab name="Effects" contentClassName={styles.picker}>
                        {effects}
                    </Tab>
                </TabPanel>
            </div>
        );
    }
}

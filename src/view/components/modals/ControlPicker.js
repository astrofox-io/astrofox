import React from 'react';
import { TabPanel, Tab } from 'components/layout/TabPanel';
import { library } from 'view/global';
import styles from './ControlPicker.less';

const types = ['displays', 'effects'];

export default function ControlPicker({ type, onSelect, onClose }) {
  function handleClick(item) {
    onSelect(item);
    onClose();
  }

  const Catalog = ({ items }) => {
    return Object.keys(items).map((key, index) => {
      const item = items[key];

      return (
        <div key={index} className={styles.item}>
          <div className={styles.image} onClick={() => handleClick(item.module)} />
          <div className={styles.name}>{item.info.label}</div>
        </div>
      );
    });
  };

  return (
    <TabPanel className={styles.panel} tabPosition="left" activeIndex={types.indexOf(type)}>
      <Tab name="Displays" contentClassName={styles.picker}>
        <Catalog items={library.get('displays')} />
      </Tab>
      <Tab name="Effects" contentClassName={styles.picker}>
        <Catalog items={library.get('effects')} />
      </Tab>
    </TabPanel>
  );
}

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

  function hideImage(e) {
    e.target.style.display = 'none';
  }

  const Catalog = ({ items }) => {
    return Object.keys(items).map((key, index) => {
      const item = items[key];
      const {
        config: { icon, label },
      } = item;

      return (
        <div key={index} className={styles.item}>
          <div className={styles.image} onClick={() => handleClick(item)}>
            <img
              src={icon || 'images/controls/Plugin.png'}
              alt={label}
              onError={hideImage}
            />
          </div>
          <div className={styles.name}>{label}</div>
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

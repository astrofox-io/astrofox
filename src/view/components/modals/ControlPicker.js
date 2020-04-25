import React from 'react';
import { useDispatch } from 'react-redux';
import { TabPanel, Tab } from 'components/layout/TabPanel';
import { addElement } from 'actions/scenes';
import * as displays from 'displays';
import * as effects from 'effects';
import styles from './ControlPicker.less';

const types = ['displays', 'effects'];

export default function ControlPicker({ type, sceneId, onClose }) {
  const dispatch = useDispatch();

  function handleClick(Item) {
    dispatch(addElement(new Item(), sceneId));
    onClose();
  }

  const Catalog = ({ items }) => {
    return Object.keys(items).map((key, index) => {
      const item = items[key];
      const style = { backgroundImage: `url(./images/controls/${item.className}.png)` };

      return (
        <div key={index} className={styles.item}>
          <div className={styles.image} onClick={() => handleClick(item)} style={style} />
          <div className={styles.name}>{item.label}</div>
        </div>
      );
    });
  };

  return (
    <TabPanel className={styles.panel} tabPosition="left" activeIndex={types.indexOf(type)}>
      <Tab name="Displays" contentClassName={styles.picker}>
        <Catalog items={displays} />
      </Tab>
      <Tab name="Effects" contentClassName={styles.picker}>
        <Catalog items={effects} />
      </Tab>
    </TabPanel>
  );
}

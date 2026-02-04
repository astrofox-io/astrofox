import React from 'react';
import classNames from 'classnames';
import MenuItem from './MenuItem';
import styles from './Menu.module.less';

const Menu = ({ items, visible, onMenuItemClick }) => (
  <div
    className={classNames(styles.menu, {
      [styles.hidden]: visible === false,
    })}
  >
    {items.map((item, index) => {
      const { type, label, hidden, checked, disabled } = item;

      if (type === 'separator') {
        return <div key={index} className={styles.separator} />;
      } else if (label && !hidden) {
        return (
          <MenuItem
            key={index}
            label={label}
            checked={checked}
            disabled={disabled}
            onClick={() => onMenuItemClick(item)}
          />
        );
      }

      return null;
    })}
  </div>
);

Menu.defaultProps = {
  items: [],
  visible: false,
};

export default Menu;

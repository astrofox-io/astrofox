import React from 'react';
import classNames from 'classnames';
import Menu from 'components/nav/Menu';
import styles from './MenuBarItem.less';

export default function MenuBarItem({
  label,
  items,
  active,
  onClick,
  onMouseOver,
  onMenuItemClick,
}) {
  function handleClick(e) {
    e.stopPropagation();
    onClick();
  }

  function handleMouseOver(e) {
    e.stopPropagation();
    onMouseOver();
  }

  return (
    <div className={styles.item}>
      <div
        className={classNames(styles.text, { [styles.active]: active })}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
      >
        {label}
      </div>
      <Menu items={items} visible={active} onMenuItemClick={onMenuItemClick} />
    </div>
  );
}

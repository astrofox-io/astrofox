import React from 'react';
import classNames from 'classnames';
import styles from './MenuItem.module.less';

const MenuItem = ({ label, checked, disabled, onClick }) => (
  <div
    className={classNames(styles.item, {
      [styles.checked]: checked,
      [styles.disabled]: disabled,
    })}
    onClick={onClick}
  >
    {label}
  </div>
);

export default MenuItem;

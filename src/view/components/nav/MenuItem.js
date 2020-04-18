import React from 'react';
import classNames from 'classnames';
import styles from './MenuItem.less';

const MenuItem = ({ label, checked, disabled, onClick }) => {
  const classes = {
    [styles.item]: true,
    [styles.checked]: checked,
    [styles.disabled]: disabled,
  };

  return (
    <div className={classNames(classes)} onClick={onClick}>
      {label}
    </div>
  );
};

export default MenuItem;

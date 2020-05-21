import React from 'react';
import classNames from 'classnames';
import styles from './Button.less';

const Button = ({ text, disabled, className, onClick }) => {
  return (
    <span
      className={classNames(styles.button, className, {
        [styles.disabled]: disabled,
      })}
      onClick={disabled ? null : onClick}
    >
      {text}
    </span>
  );
};

export default Button;

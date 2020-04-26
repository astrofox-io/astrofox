import React from 'react';
import classNames from 'classnames';
import styles from './Control.less';

const Option = ({ className, children }) => (
  <div className={classNames(styles.option, className)}>{children}</div>
);

const Control = ({ label, active, className, displayName, children }) => (
  <div
    className={classNames(
      {
        [styles.control]: true,
        [styles.active]: active,
      },
      className,
    )}
  >
    {label && (
      <div className={styles.header}>
        <span className={styles.text}>{label}</span>
        <span className={styles.displayName}>{displayName}</span>
      </div>
    )}
    {children}
  </div>
);

const Label = ({ text, className, children }) => (
  <div className={classNames(styles.label, className)}>
    {text}
    {children}
  </div>
);

export { Option, Control, Label };

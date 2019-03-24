import React, { Children, cloneElement } from 'react';
import classNames from 'classnames';
import ReactorInput from 'components/inputs/ReactorInput';
import styles from './Control.less';

const Option = ({ className, children, display }) => (
  <div className={classNames(styles.option, className)}>
    {Children.map(children, child => {
      if (display && child && child.type === ReactorInput) {
        return cloneElement(child, { display });
      }
      return child;
    })}
  </div>
);

const Control = ({ label, active, className, display, children }) => (
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
        <span className={styles.displayName}>{display.options.displayName}</span>
      </div>
    )}
    {Children.map(children, child => {
      if (display && child && child.type === Option) {
        return cloneElement(child, { display });
      }
      return child;
    })}
  </div>
);

const Label = ({ text, className, children }) => (
  <div className={classNames(styles.label, className)}>
    {text}
    {children && children}
  </div>
);

export { Option, Control, Label };

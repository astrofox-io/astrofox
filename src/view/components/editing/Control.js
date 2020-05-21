import React from 'react';
import Option from 'components/editing/Option';
import classNames from 'classnames';
import { inputToProps, mapChildren } from 'utils/react';
import styles from './Control.less';

export default function Control({ display, label, active, className, children, onChange }) {
  const { displayName } = display.properties;

  function handleClone(child, props) {
    if (child.type === Option) {
      return [child, props];
    }
    return [child];
  }

  return (
    <div
      className={classNames(styles.control, className, {
        [styles.active]: active,
      })}
    >
      {label && (
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.label}>{label}</div>
            <div className={styles.displayName}>{displayName}</div>
          </div>
        </div>
      )}
      {mapChildren(children, { display, onChange: inputToProps(onChange) }, handleClone)}
    </div>
  );
}

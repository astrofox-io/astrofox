import React, { Children, Fragment, cloneElement } from 'react';
import Option from 'components/editing/Option';
import classNames from 'classnames';
import styles from './Control.less';

function mapChildren(children, props) {
  return Children.map(children, child => {
    if (child) {
      if (child.type === Option) {
        return cloneElement(child, props);
      } else if (child.type === Fragment) {
        return mapChildren(child.props.children, props);
      }
    }
    return child;
  });
}

export default function Control({ display, label, active, className, children, onChange }) {
  const { displayName } = display;

  return (
    <div
      className={classNames(styles.control, className, {
        [styles.active]: active,
      })}
    >
      {label && (
        <div className={styles.header}>
          <span className={styles.text}>{label}</span>
          <span className={styles.displayName}>{displayName}</span>
        </div>
      )}
      {mapChildren(children, { display, onChange })}
    </div>
  );
}

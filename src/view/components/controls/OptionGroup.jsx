import React, { Children, cloneElement } from 'react';
import classNames from 'classnames';
import styles from './OptionGroup.module.less';

export default function OptionGroup({ title, className, children, ...props }) {
  return (
    <div className={classNames(styles.group, className)}>
      {title && <div className={styles.header}>{title}</div>}
      <div className={styles.body}>
        {Children.map(children, child => {
          if (child) {
            return cloneElement(child, { ...props });
          }
          return child;
        })}
      </div>
    </div>
  );
}

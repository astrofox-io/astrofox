import React from 'react';
import classNames from 'classnames';
import styles from './Layout.module.less';

export default function Layout({
  className,
  children,
  direction = 'column',
  grow = true,
  full = false,
  width,
  height,
  padding,
  margin,
  ...props
}) {
  return (
    <div
      {...props}
      className={classNames(styles.container, className, {
        [styles.row]: direction === 'row',
        [styles.column]: direction === 'column',
        [styles.grow]: grow,
        [styles.full]: full,
      })}
      style={{ width, height, padding, margin }}
    >
      {children}
    </div>
  );
}

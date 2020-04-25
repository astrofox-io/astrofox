import React, { forwardRef } from 'react';
import classNames from 'classnames';
import styles from './Layout.less';

const Layout = forwardRef(({ className, children, direction = 'column', fill = true }, ref) => {
  return (
    <div
      className={classNames(styles.container, className, {
        [styles.row]: direction === 'row',
        [styles.column]: direction === 'column',
        [styles.fill]: fill,
      })}
      ref={ref}
    >
      {children}
    </div>
  );
});

export default Layout;

import React from 'react';
import classNames from 'classnames';
import styles from './Dialog.less';

const Dialog = ({ icon, message }) => (
  <div className={styles.dialog}>
    {icon && <span className={classNames(styles.icon, icon)} />}
    <span className={styles.message}>{message}</span>
  </div>
);

export default Dialog;

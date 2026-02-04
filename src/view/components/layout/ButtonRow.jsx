import React from 'react';
import styles from './ButtonRow.module.less';

export default function ButtonRow({ children }) {
  return <div className={styles.buttons}>{children}</div>;
}

import React from 'react';
import styles from './ButtonRow.less';

export default function ButtonRow({ children }) {
  return <div className={styles.buttons}>{children}</div>;
}

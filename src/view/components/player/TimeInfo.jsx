import React from 'react';
import { formatTime } from 'utils/format';
import styles from './TimeInfo.module.less';

export default function TimeInfo({ currentTime, totalTime }) {
  return (
    <div className={styles.timeInfo}>
      <div className={styles.currentTime}>{formatTime(currentTime)}</div>
      <div className={styles.splitter} />
      <div className={styles.totalTime}>{formatTime(totalTime)}</div>
    </div>
  );
}

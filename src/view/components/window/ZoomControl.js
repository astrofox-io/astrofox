import React from 'react';
import useStage, { setZoom } from 'actions/stage';
import styles from './ZoomControl.less';

export default function Zoom() {
  const { width, height, zoom } = useStage(state => state);

  return (
    <div className={styles.zoom}>
      <span className={styles.label} onClick={() => setZoom(0)}>{`${width} x ${height}`}</span>
      <span className={styles.button} onClick={() => setZoom(-1)}>
        {'\uff0d'}
      </span>
      <span className={styles.value}>{`${zoom}%`}</span>
      <span className={styles.button} onClick={() => setZoom(1)}>
        {'\uff0b'}
      </span>
    </div>
  );
}

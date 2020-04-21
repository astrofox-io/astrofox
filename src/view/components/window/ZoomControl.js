import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateZoom } from 'actions/stage';
import styles from './ZoomControl.less';

export default function Zoom() {
  const dispatch = useDispatch();
  const { width, height, zoom } = useSelector(state => state.stage);

  return (
    <div className={styles.zoom}>
      <span className={styles.label}>{`${width} x ${height}`}</span>
      <span className={styles.button} onClick={() => dispatch(updateZoom(-1))}>
        {'\uff0d'}
      </span>
      <span className={styles.value}>{`${zoom}%`}</span>
      <span className={styles.button} onClick={() => dispatch(updateZoom(1))}>
        {'\uff0b'}
      </span>
    </div>
  );
}

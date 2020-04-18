import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { env, events } from 'view/global';
import useForceUpdate from 'components/hooks/useForceUpdate';
import { formatSize } from 'utils/format';
import { updateStage } from 'actions/stage';
import styles from './StatusBar.less';

const { APP_VERSION } = env;

export default function StatusBar() {
  const forceUpdate = useForceUpdate();
  const [fps, setFps] = useState();
  const { statusText } = useSelector(({ app }) => app);
  const { width, height, zoom } = useSelector(({ stage }) => stage);
  const dispatch = useDispatch();

  let memSize;
  let electronVersion;

  if (process.env.NODE_ENV !== 'production') {
    memSize = formatSize(window.performance.memory.usedJSHeapSize, 2);
    electronVersion = process.versions.electron;
  }

  function updateStats(frame) {
    setFps(frame.fps);
    forceUpdate();
  }

  useEffect(() => {
    events.on('tick', updateStats);

    return () => {
      events.off('tick', updateStats);
    };
  });

  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        <span className={styles.item}>{statusText}</span>
      </div>
      <div className={styles.center}>
        <Zoom
          value={zoom}
          width={width}
          height={height}
          onChange={value => dispatch(updateStage({ zoom: value }))}
        />
      </div>
      <div className={styles.right}>
        <span className={styles.item}>{memSize}</span>
        <span className={styles.item}>{electronVersion}</span>
        <span className={styles.item}>{`${fps} FPS`}</span>
        <span className={styles.item}>{APP_VERSION}</span>
      </div>
    </div>
  );
}

const Zoom = ({ width, height, value, onChange }) => (
  <div className={styles.zoom}>
    <span className={styles.item}>{`${width} x ${height}`}</span>
    <span className={styles.zoomButton} onClick={() => onChange(-1)}>
      {'\uff0d'}
    </span>
    <span className={styles.zoomValue}>{`${value * 100}%`}</span>
    <span className={styles.zoomButton} onClick={() => onChange(1)}>
      {'\uff0b'}
    </span>
  </div>
);

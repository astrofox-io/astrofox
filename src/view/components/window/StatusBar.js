import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { env, events } from 'view/global';
import { formatSize } from 'utils/format';
import ZoomControl from 'components/window/ZoomControl';
import styles from './StatusBar.less';

const { APP_VERSION } = env;

export default function StatusBar() {
  const statusText = useSelector(state => state.app.statusText);

  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        <span className={styles.item}>{statusText}</span>
      </div>
      <div className={styles.center}>
        <ZoomControl />
      </div>
      <div className={styles.right}>
        {process.env.NODE_ENV !== 'production' && <MemoryInfo />}
        <FrameRate />
        <span className={styles.item}>{APP_VERSION}</span>
      </div>
    </div>
  );
}

function MemoryInfo() {
  const [mem, setMem] = useState();

  function updateStats() {
    setMem(formatSize(window.performance.memory.usedJSHeapSize, 2));
  }

  useEffect(() => {
    events.on('tick', updateStats);

    return () => {
      events.off('tick', updateStats);
    };
  });

  return <span className={styles.item}>{mem}</span>;
}

function FrameRate() {
  const [fps, setFps] = useState();

  function updateStats(frame) {
    setFps(frame.fps);
  }

  useEffect(() => {
    events.on('tick', updateStats);

    return () => {
      events.off('tick', updateStats);
    };
  });

  return <span className={styles.item}>{`${fps} FPS`}</span>;
}

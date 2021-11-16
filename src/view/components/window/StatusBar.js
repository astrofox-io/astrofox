import React, { useState, useEffect } from 'react';
import { env, renderer } from 'view/global';
import useAppStore from 'actions/app';
import { formatSize } from 'utils/format';
import ZoomControl from 'components/window/ZoomControl';
import styles from './StatusBar.less';

const { APP_VERSION } = env;

export default function StatusBar() {
  const statusText = useAppStore(state => state.statusText);
  const [{ mem, fps }, setState] = useState({});

  function updateStats() {
    setState({
      fps: `${renderer.getFPS()} FPS`,
      mem: formatSize(window.performance.memory.usedJSHeapSize, 2) });
  }

  useEffect(() => {
    const id = window.setInterval(updateStats, 500);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        <InfoItem value={statusText} />
      </div>
      <div className={styles.center}>
        <ZoomControl />
      </div>
      <div className={styles.right}>
        {process.env.NODE_ENV !== 'production' && <InfoItem value={mem} />}
        <InfoItem value={fps} />
        <InfoItem value={APP_VERSION} />
      </div>
    </div>
  );
}

function InfoItem({ value }) {
  return <span className={styles.item}>{value}</span>
}

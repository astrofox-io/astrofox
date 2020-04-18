import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import Button from 'components/interface/Button';
import { video } from 'view/global';
import { formatTime } from 'utils/format';
import styles from './RenderInfo.less';

const defaultState = {
  complete: false,
  frames: 0,
  currentFrame: 0,
  lastFrame: 0,
  startTime: 0,
};

export default function RenderInfo({ className, onClose }) {
  const [state, setState] = useState(defaultState);
  const { frames, currentFrame, lastFrame, startTime, complete } = state;
  const { renderer } = video;
  const elapsedTime = (window.performance.now() - startTime) / 1000;
  const frame = frames - (lastFrame - currentFrame);
  const progress = frames > 0 ? (frame / frames) * 100 : 0;
  const fps = elapsedTime > 0 ? frame / elapsedTime : 0;
  const text = complete ? 'Finished' : 'Cancel';
  const style = { width: `${progress}%` };

  function handleButtonClick() {
    renderer.stop();

    onClose();
  }

  function setComplete() {
    setState({ ...state, complete: true });
  }

  function updateStats() {
    const { frames, currentFrame, lastFrame, startTime } = renderer;

    setState({
      ...state,
      frames,
      currentFrame,
      lastFrame,
      startTime,
    });
  }

  useEffect(() => {
    renderer.on('ready', updateStats, this);
    renderer.on('complete', setComplete, this);

    renderer.start();

    return () => {
      renderer.off('ready', updateStats, this);
      renderer.off('complete', setComplete, this);
    };
  }, []);

  return (
    <div className={classNames(styles.renderInfo, className)}>
      <div className={styles.progress}>
        <div className={styles.progressBar} style={style} />
      </div>
      <div className={styles.stats}>
        <Stat label="Progress" value={`${~~progress}%`} />
        <Stat label="Elapsed Time" value={formatTime(elapsedTime)} />
        <Stat label="Frames" value={`${~~frame} / ${~~frames}`} />
        <Stat label="FPS" value={fps.toFixed(1)} />
        <Button text={text} onClick={handleButtonClick} />
      </div>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className={styles.info}>
    <span className={styles.label}>{label}</span>
    {value}
  </div>
);

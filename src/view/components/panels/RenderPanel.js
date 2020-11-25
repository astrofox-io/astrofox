import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import CanvasMeter from 'canvas/CanvasMeter';
import Button from 'components/interface/Button';
import { videoRenderer } from 'view/global';
import { formatTime } from 'utils/format';
import { stopRender } from 'actions/video';
import { PRIMARY_COLOR } from 'view/constants';
import styles from './RenderPanel.less';

const initialState = {
  finished: false,
  frames: 0,
  currentFrame: 0,
  lastFrame: 0,
  startTime: 0,
};

export default function RenderPanel({ onClose }) {
  const [state, setState] = useState(initialState);
  const { status, frames, currentFrame, lastFrame, startTime, finished } = state;
  const elapsedTime = (Date.now() - startTime) / 1000;
  const frame = frames - (lastFrame - currentFrame);
  const progress = frames > 0 ? frame / frames : 0;
  const fps = elapsedTime > 0 ? frame / elapsedTime : 0;
  const canvas = useRef();
  const progressBar = useRef();

  const totalTime = frame > 0 ? (frames * elapsedTime) / frame : null;
  const estimatedTotalTimeThreshold = 0.1;
  const estimatedTotalTime =
    progress > 0.05 ? ` / ${estimatedTotalTimeThreshold && formatTime(totalTime)}` : '';

  function handleButtonClick() {
    stopRender();

    onClose();
  }

  function setFinished() {
    setState(state => ({ ...state, finished: true }));
  }

  function updateStatus(status) {
    setState(state => ({ ...state, status }));
  }

  function updateStats(stats) {
    if (stats && stats.currentFrame > currentFrame) {
      setState(state => ({
        ...state,
        ...stats,
      }));
    }
  }

  function draw() {
    progressBar.current.render(progress);
  }

  useEffect(() => {
    progressBar.current = new CanvasMeter(
      {
        width: 100,
        height: 5,
        color: PRIMARY_COLOR,
      },
      canvas.current,
    );

    videoRenderer.on('status', updateStatus);
    videoRenderer.on('stats', updateStats);
    videoRenderer.on('finished', setFinished);

    return () => {
      videoRenderer.off('status', updateStatus);
      videoRenderer.off('stats', updateStats);
      videoRenderer.off('finished', setFinished);

      stopRender();
    };
  }, []);

  useEffect(() => {
    draw();
  });

  return (
    <div className={classNames(styles.panel)}>
      <div className={styles.progress}>
        <canvas ref={canvas} className={styles.progressBar} />
      </div>
      <div className={styles.stats}>
        <div className={styles.row}>
          <Stat label="Progress" value={`${~~(progress * 100)}%`} />
          <Stat label="Elapsed Time" value={`${formatTime(elapsedTime)}${estimatedTotalTime}`} />
          <Stat label="Frames" value={`${~~frame} / ${~~frames}`} />
          <Stat label="FPS" value={fps.toFixed(1)} />
          <Button text={finished ? 'Close' : 'Cancel'} onClick={handleButtonClick} />
        </div>
        <div className={styles.row}>
          <Stat label="Status" value={status} />
        </div>
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

import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import CanvasMeter from 'canvas/CanvasMeter';
import Button from 'components/interface/Button';
import { formatTime } from 'utils/format';
import useVideo, { stopRender } from 'actions/video';
import { PRIMARY_COLOR } from 'view/constants';
import styles from './RenderPanel.module.less';

const PROGRESS_MIN = 0.05;
const PROGRESS_THRESHHOLD = 0.1;

export default function RenderPanel({ onClose = () => {} }) {
  const { finished, status, currentFrame, totalFrames, startTime } = useVideo();
  const elapsedTime = startTime ? (Date.now() - startTime) / 1000 : 0;
  const fps = elapsedTime > 0 ? currentFrame / elapsedTime : 0;
  const progress = totalFrames > 0 ? currentFrame / totalFrames : 0;
  const totalTime = currentFrame > 0 ? (totalFrames * elapsedTime) / currentFrame : null;
  const estimatedTotalTime =
    progress > PROGRESS_MIN ? ` / ${PROGRESS_THRESHHOLD && formatTime(totalTime)}` : '';
  const currentTotalTime = formatTime(elapsedTime);
  const canvas = useRef();
  const progressBar = useRef();

  function handleClose() {
    stopRender();
    onClose();
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
          <Stat label="Elapsed Time" value={`${currentTotalTime}${estimatedTotalTime}`} />
          <Stat label="Frames" value={`${~~currentFrame} / ${~~totalFrames}`} />
          <Stat label="FPS" value={fps.toFixed(1)} />
          <Button text={finished ? 'Close' : 'Cancel'} onClick={handleClose} />
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

import React, { useRef, useMemo, useLayoutEffect, useImperativeHandle } from 'react';
import classNames from 'classnames';
import CanvasAudio from 'canvas/CanvasAudio';
import styles from './AudioWaveform.less';

const canvasProperties = {
  width: 854,
  height: 70,
  shadowHeight: 30,
  barWidth: 3,
  barSpacing: 1,
  bgColor: '#333333',
  bars: 213,
};

export default function AudioWaveform({
  visible = true,
  progressPosition = 0,
  seekPosition = 0,
  onClick = () => {},
  onSeek = () => {},
  forwardedRef,
}) {
  const canvas = useRef();
  const { width, height, shadowHeight } = canvasProperties;

  const [baseCanvas, progressCanvas, seekCanvas] = useMemo(
    () => [
      new CanvasAudio({
        ...canvasProperties,
        color: ['#555555', '#444444'],
        shadowColor: '#333333',
      }),
      new CanvasAudio({
        ...canvasProperties,
        color: ['#B6AAFF', '#927FFF'],
        shadowColor: '#554B96',
      }),
      new CanvasAudio({
        ...canvasProperties,
        color: ['#8880BF', '#6C5FBF'],
        shadowColor: '#403972',
      }),
    ],
    [],
  );

  function handleClick(e) {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    onClick((e.clientX - rect.left) / rect.width);
  }

  function handleMouseMove(e) {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    onSeek((e.clientX - rect.left) / rect.width);
  }

  function handleMouseOut(e) {
    e.stopPropagation();

    onSeek(0);
  }

  function draw() {
    const { width, height } = canvas.current;
    const context = canvas.current.getContext('2d');
    const position = progressPosition * width;
    const seek = seekPosition * width;
    const sx = seek < position ? seek : position;
    const dx = seek < position ? position - seek : seek - position;

    context.clearRect(0, 0, width, height);

    context.drawImage(
      baseCanvas.getCanvas(),
      position,
      0,
      width - position,
      height,
      position,
      0,
      width - position,
      height,
    );

    if (position > 0) {
      context.drawImage(progressCanvas.getCanvas(), 0, 0, position, height, 0, 0, position, height);
    }

    if (seek > 0) {
      context.drawImage(seekCanvas.getCanvas(), sx, 0, dx, height, sx, 0, dx, height);
    }
  }

  function loadAudio({ buffer }) {
    baseCanvas.render(buffer);
    progressCanvas.render(buffer);
    seekCanvas.render(buffer);
  }

  useImperativeHandle(forwardedRef, () => ({
    draw,
    loadAudio,
  }));

  useLayoutEffect(() => {
    draw();
  });

  return (
    <div
      className={classNames({
        [styles.waveform]: true,
        [styles.hidden]: !visible,
      })}
    >
      <canvas
        ref={canvas}
        className={styles.canvas}
        width={width}
        height={height + shadowHeight}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseOut}
      />
    </div>
  );
}

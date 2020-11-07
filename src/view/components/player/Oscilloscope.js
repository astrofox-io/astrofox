import React, { useRef, useEffect } from 'react';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';
import { events } from 'view/global';
import { PRIMARY_COLOR } from 'view/constants';
import styles from './Oscilloscope.less';

const canvasProperties = {
  width: 854,
  height: 50,
  strokeColor: PRIMARY_COLOR,
};

export default function Oscilloscope() {
  const { width, height } = canvasProperties;
  const canvas = useRef();
  const display = useRef();
  const parser = useRef();

  function draw({ td }) {
    display.current.render(parser.current.parseTimeData(td, width));
  }

  useEffect(() => {
    events.on('render', draw);
    display.current = new CanvasWave(canvasProperties, canvas.current);
    parser.current = new WaveParser();

    return () => {
      events.off('render', draw);
    };
  });

  return (
    <div className={styles.oscilloscope}>
      <canvas ref={canvas} className={styles.canvas} width={width} height={height} />
    </div>
  );
}

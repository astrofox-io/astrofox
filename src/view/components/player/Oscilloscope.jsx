import React, { useRef, useEffect } from 'react';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';
import { events } from 'view/global';
import { PRIMARY_COLOR } from 'view/constants';
import styles from './Oscilloscope.module.less';

const canvasProperties = {
  width: 854,
  height: 50,
  midpoint: 25,
  strokeColor: PRIMARY_COLOR,
};

export default function Oscilloscope() {
  const { width, height } = canvasProperties;
  const canvas = useRef();
  const display = useRef();
  const parser = useRef();

  function draw({ td }) {
    const data = parser.current.parseTimeData(td, width);

    display.current.render(Array.from(data).flatMap((n, i) => [i, n]));
  }

  useEffect(() => {
    events.on('render', draw);
    display.current = new CanvasWave(canvasProperties, canvas.current);
    parser.current = new WaveParser();

    return () => {
      events.off('render', draw);
    };
  }, []);

  return (
    <div className={styles.oscilloscope}>
      <canvas ref={canvas} className={styles.canvas} width={width} height={height} />
    </div>
  );
}

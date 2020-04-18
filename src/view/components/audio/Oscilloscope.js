import React, { useRef, useEffect, useImperativeHandle } from 'react';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';
import styles from './Oscilloscope.less';

const canvasProperties = {
  width: 854,
  height: 50,
  color: '#927FFF',
};

export default function Oscilloscope({ forwardedRef }) {
  const { width, height } = canvasProperties;
  const canvas = useRef();
  const display = useRef();
  const parser = useRef();

  function draw({ td }) {
    display.current.render(parser.current.parseTimeData(td, width));
  }

  useImperativeHandle(forwardedRef, () => ({ draw }));

  useEffect(() => {
    display.current = new CanvasWave(canvasProperties, canvas.current);
    parser.current = new WaveParser();
  }, []);

  return (
    <div className={styles.oscilloscope}>
      <canvas ref={canvas} className={styles.canvas} width={width} height={height} />
    </div>
  );
}

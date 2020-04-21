import React, { useEffect, useRef, useImperativeHandle } from 'react';
import SpectrumParser from 'audio/SpectrumParser';
import CanvasBars from 'canvas/CanvasBars';
import { FFT_SIZE, SAMPLE_RATE, DEFAULT_CANVAS_WIDTH } from 'view/constants';
import styles from './Spectrum.less';

const spectrumProperties = {
  width: 854,
  height: 50,
  barWidth : -1,
  barSpacing: 1,
  shadowHeight: 0,
  minHeight: 1,
  color: '#775FD8',
  backgroundColor: '#FF0000',
};

const parserProperties = {
  fftSize: FFT_SIZE,
  sampleRate: SAMPLE_RATE,
  smoothingTimeConstant: 0.5,
  minDecibels: -60,
  maxDecibels: -20,
  minFrequency: 0,
  maxFrequency: 10000,
  normalize: false,
  bins: 32,
};

export default function Spectrum({ forwardedRef }) {
  const canvas = useRef();
  const bars = useRef();
  const parser = useRef();

  function handleClick() {
    parser.current.update({ normalize: !prevState.normalize })
    this.setState(
      prevState => ({ normalize: !prevState.normalize }),
      () => {
        this.parser.update(this.state);
      },
    );
  };

  function draw(data) {
    const fft = parser.current.parseFFT(data.fft);

    bars.current.render(fft);
  };

  useImperativeHandle(forwardedRef, () => ({ draw }));

  useEffect(() => {
    bars.current = new CanvasBars(spectrumProperties, canvas.current);
    parser.current = new SpectrumParser(parserProperties);
  }, [bars, parser]);

    return (
      <div className={styles.spectrum}>
        <canvas
          ref={canvas}
          className={styles.canvas}
          width={width}
          height={height}
          onClick={handleClick}
        />
      </div>
    );

}

import React, { PureComponent } from 'react';
import SpectrumParser from 'audio/SpectrumParser';
import CanvasBars from 'canvas/CanvasBars';
import { FFT_SIZE, SAMPLE_RATE, CANVAS_WIDTH } from 'view/constants';
import styles from './Spectrum.less';

export default class Spectrum extends PureComponent {
  static defaultProps = {
    width: CANVAS_WIDTH,
    height: 50,
    barWidth: -1,
    barSpacing: 1,
    shadowHeight: 0,
    minHeight: 1,
    color: '#775FD8',
    backgroundColor: '#FF0000',
  };

  state = {
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

  componentDidMount() {
    this.bars = new CanvasBars(this.props, this.canvas);

    this.parser = new SpectrumParser(this.state);
  }

  handleClick = () => {
    this.setState(
      prevState => ({ normalize: !prevState.normalize }),
      () => {
        this.parser.update(this.state);
      },
    );
  };

  draw = data => {
    const fft = this.parser.parseFFT(data.fft);

    this.bars.render(fft);
  };

  render() {
    const { width, height } = this.props;

    return (
      <div className={styles.spectrum}>
        <canvas
          ref={e => (this.canvas = e)}
          className={styles.canvas}
          width={width}
          height={height}
          onClick={this.handleClick}
        />
      </div>
    );
  }
}

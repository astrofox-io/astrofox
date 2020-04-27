import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Control, Option } from 'components/editing';
import Icon from 'components/interface/Icon';
import { BoxInput } from 'components/inputs';
import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'view/global';
import { hideActiveReactor } from 'actions/app';
import { ChevronDown } from 'view/icons';
import styles from './ReactorControl.less';

const REACTOR_BARS = 64;

const outputOptions = ['Subtract', 'Add', 'Reverse', 'Forward', 'Cycle'];

export default function ReactorControl({ reactor, barWidth = 8, barHeight = 100, barSpacing = 1 }) {
  const dispatch = useDispatch();
  const spectrum = useRef();
  const meter = useRef();
  const box = useRef();
  const spectrumCanvas = useRef();
  const outputCanvas = useRef();

  function handleChange(name, value) {
    if (['selection', 'outputMode'].includes(name)) {
      this.updateReactor(name, value);
    } else {
      this.updateParser(name, value);
    }
  }

  function draw() {
    if (reactor) {
      const { fft, output } = reactor.getResult();

      spectrum.current.render(fft);
      meter.current.render(output);
    }
  }

  function updateReactor(name, value) {
    const obj = { [name]: value };

    if (name === 'selection') {
      const { x, y, width, height } = value;
      const maxWidth = REACTOR_BARS * (barWidth + barSpacing);
      const maxHeight = barHeight;

      obj.range = {
        x1: x / maxWidth,
        x2: (x + width) / maxWidth,
        y1: y / maxHeight,
        y2: (y + height) / maxHeight,
      };
    }

    reactor.update(obj);
  }

  function updateParser(name, value) {
    reactor.parser.update({ [name]: value });
  }

  function hideReactor() {
    dispatch(hideActiveReactor());
  }

  useEffect(() => {
    spectrum.current = new CanvasBars(
      {
        width: REACTOR_BARS * (barWidth + barSpacing),
        height: barHeight,
        barWidth,
        barSpacing,
        shadowHeight: 0,
        color: '#775FD8',
        backgroundColor: '#FF0000',
      },
      spectrumCanvas.current,
    );

    meter.current = new CanvasMeter(
      {
        width: 20,
        height: barHeight,
        color: '#775FD8',
        origin: 'bottom',
      },
      outputCanvas.current,
    );

    events.on('render', draw);

    return () => {
      events.off('render', draw);
    };
  });

  return (
    <div className={styles.reactor}>
      <Header path={reactor.properties.displayName.split('/')} />
      <div className={styles.display}>
        <div className={styles.controls}>
          <Controls reactor={reactor} onChange={handleChange} />
        </div>
        <div className={styles.spectrum}>
          <canvas
            ref={spectrumCanvas}
            width={REACTOR_BARS * (barWidth + barSpacing)}
            height={barHeight}
          />
          <BoxInput
            ref={box}
            name="selection"
            value={reactor ? reactor.properties.selection : {}}
            minWidth={barWidth}
            minHeight={barWidth}
            maxWidth={REACTOR_BARS * (barWidth + barSpacing)}
            maxHeight={barHeight}
            onChange={handleChange}
          />
        </div>
        <div className={styles.output}>
          <canvas ref={outputCanvas} width={20} height={barHeight} />
        </div>
      </div>
      <Icon
        className={styles.closeIcon}
        glyph={ChevronDown}
        title="Hide Panel"
        onClick={hideReactor}
      />
    </div>
  );
}

const Header = ({ path }) => (
  <div className={styles.header}>
    {path.map((item, index) => (
      <span key={index} className={styles.node}>
        {item}
      </span>
    ))}
  </div>
);

const Controls = ({ reactor, onChange }) => {
  const { maxDecibels, smoothingTimeConstant } = reactor.parser.properties;
  const { outputMode } = reactor.properties;

  return (
    <Control display={reactor} onChange={onChange}>
      <Option
        label="Output Mode"
        type="select"
        items={outputOptions}
        name="outputMode"
        value={outputMode}
      />
      <Option
        label="Max dB"
        type="number"
        name="maxDecibels"
        value={maxDecibels}
        min={-40}
        max={0}
        step={1}
      />
      <Option
        label="Smoothing"
        name="smoothingTimeConstant"
        value={smoothingTimeConstant}
        min={0}
        max={0.99}
        step={0.01}
      />
    </Control>
  );
};

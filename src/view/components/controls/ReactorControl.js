import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';
import Icon from 'components/interface/Icon';
import { BoxInput } from 'components/inputs';
import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import { setActiveReactorId } from 'actions/app';
import { events } from 'view/global';
import { ChevronDown } from 'view/icons';
import { PRIMARY_COLOR } from 'view/constants';
import { contains } from 'utils/array';
import { inputToProps } from 'utils/react';
import styles from './ReactorControl.less';

const REACTOR_BARS = 64;
const BAR_WIDTH = 8;
const BAR_HEIGHT = 100;
const BAR_SPACING = 1;

const outputOptions = ['Subtract', 'Add', 'Reverse', 'Forward', 'Cycle'];

export default function ReactorControl({ reactor }) {
  const dispatch = useDispatch();
  const spectrum = useRef();
  const meter = useRef();
  const spectrumCanvas = useRef();
  const outputCanvas = useRef();
  const onChange = useEntity(reactor);
  const onParserChange = useEntity(reactor.parser);
  const { selection } = reactor.properties;

  function handleChange(props) {
    const keys = Object.keys(props);

    if (contains(keys, ['selection', 'outputMode'])) {
      const { selection } = props;
      if (selection) {
        const { x, y, width, height } = selection;
        const maxWidth = REACTOR_BARS * (BAR_WIDTH + BAR_SPACING);
        const maxHeight = BAR_HEIGHT;

        props.range = {
          x1: x / maxWidth,
          x2: (x + width) / maxWidth,
          y1: y / maxHeight,
          y2: (y + height) / maxHeight,
        };
      }

      onChange(props);
    } else {
      onParserChange(props);
    }
  }

  function hideReactor() {
    dispatch(setActiveReactorId(null));
  }

  function draw() {
    const { fft, output } = reactor.getResult();

    spectrum.current.render(fft);
    meter.current.render(output);
  }

  useEffect(() => {
    spectrum.current = new CanvasBars(
      {
        width: REACTOR_BARS * (BAR_WIDTH + BAR_SPACING),
        height: BAR_HEIGHT,
        BAR_WIDTH,
        BAR_SPACING,
        shadowHeight: 0,
        color: '#775FD8',
        backgroundColor: '#FF0000',
      },
      spectrumCanvas.current,
    );

    meter.current = new CanvasMeter(
      {
        width: 20,
        height: BAR_HEIGHT,
        color: PRIMARY_COLOR,
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
            width={REACTOR_BARS * (BAR_WIDTH + BAR_SPACING)}
            height={BAR_HEIGHT}
          />
          <BoxInput
            name="selection"
            value={selection}
            minWidth={BAR_WIDTH}
            minHeight={BAR_WIDTH}
            maxWidth={REACTOR_BARS * (BAR_WIDTH + BAR_SPACING)}
            maxHeight={BAR_HEIGHT}
            onChange={inputToProps(handleChange)}
          />
        </div>
        <div className={styles.output}>
          <canvas ref={outputCanvas} width={20} height={BAR_HEIGHT} />
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
        withRange
      />
      <Option
        label="Smoothing"
        type="number"
        name="smoothingTimeConstant"
        value={smoothingTimeConstant}
        min={0}
        max={0.99}
        step={0.01}
        withRange
      />
    </Control>
  );
};

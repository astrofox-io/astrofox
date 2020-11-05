import React, { useEffect, useRef } from 'react';
import { Control } from 'components/controls';
import useEntity from 'hooks/useEntity';
import Icon from 'components/interface/Icon';
import { BoxInput } from 'components/inputs';
import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import useApp, { setActiveReactorId } from 'actions/app';
import { events, reactors } from 'global';
import { ChevronDown } from 'icons';
import {
  PRIMARY_COLOR,
  REACTOR_BARS,
  REACTOR_BAR_WIDTH,
  REACTOR_BAR_HEIGHT,
  REACTOR_BAR_SPACING,
} from 'view/constants';
import { inputValueToProps } from 'utils/react';
import styles from './ReactorPanel.less';

const SPECTRUM_WIDTH = REACTOR_BARS * (REACTOR_BAR_WIDTH + REACTOR_BAR_SPACING);
const METER_WIDTH = 20;

export default function ReactorPanel() {
  const activeReactorId = useApp(state => state.activeReactorId);
  const reactor = reactors.getElementById(activeReactorId);
  console.log('new reactor', activeReactorId);

  if (!reactor) {
    return null;
  }

  return <ReactorControl reactor={reactor} />;
}

const ReactorControl = ({ reactor }) => {
  const spectrum = useRef();
  const meter = useRef();
  const spectrumCanvas = useRef();
  const outputCanvas = useRef();
  const onChange = useEntity(reactor);

  function handleChange(props) {
    onChange(props);
  }

  function hideReactor() {
    setActiveReactorId(null);
  }

  function draw() {
    const { fft, output } = reactor.getResult();

    spectrum.current.render(fft);
    meter.current.render(output);
  }

  useEffect(() => {
    spectrum.current = new CanvasBars(
      {
        width: SPECTRUM_WIDTH,
        height: REACTOR_BAR_HEIGHT,
        barWidth: REACTOR_BAR_WIDTH,
        barSpacing: REACTOR_BAR_SPACING,
        shadowHeight: 0,
        color: '#775FD8',
        backgroundColor: '#FF0000',
      },
      spectrumCanvas.current,
    );

    meter.current = new CanvasMeter(
      {
        width: METER_WIDTH,
        height: REACTOR_BAR_HEIGHT,
        color: PRIMARY_COLOR,
        origin: 'bottom',
      },
      outputCanvas.current,
    );

    events.on('render', draw);

    return () => {
      events.off('render', draw);
      spectrum.current = null;
      meter.current = null;
    };
  }, [reactor]);

  return (
    <div className={styles.reactor}>
      <Header path={reactor.displayName.split('/')} />
      <div className={styles.display}>
        <div className={styles.controls}>
          <Control display={reactor} />
        </div>
        <div className={styles.spectrum}>
          <canvas ref={spectrumCanvas} width={SPECTRUM_WIDTH} height={REACTOR_BAR_HEIGHT} />
          <BoxInput
            name="selection"
            value={reactor.properties.selection}
            minWidth={REACTOR_BAR_WIDTH}
            minHeight={REACTOR_BAR_WIDTH}
            maxWidth={SPECTRUM_WIDTH}
            maxHeight={REACTOR_BAR_HEIGHT}
            onChange={inputValueToProps(handleChange)}
          />
        </div>
        <div className={styles.output}>
          <canvas ref={outputCanvas} width={METER_WIDTH} height={REACTOR_BAR_HEIGHT} />
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
};

const Header = ({ path }) => (
  <div className={styles.header}>
    {path.map((item, index) => (
      <span key={index} className={styles.node}>
        {item}
      </span>
    ))}
  </div>
);

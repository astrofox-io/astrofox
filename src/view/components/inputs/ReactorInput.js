import React, { useRef, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import CanvasMeter from 'canvas/CanvasMeter';
import Icon from 'components/interface/Icon';
import { setActiveReactorId } from 'actions/app';
import { removeReactor } from 'actions/reactors';
import { loadScenes } from 'actions/scenes';
import { events, reactors } from 'view/global';
import { Times } from 'view/icons';
import { PRIMARY_COLOR } from 'view/constants';
import styles from './ReactorInput.less';

export default function ReactorInput({
  display,
  name,
  value,
  width = 100,
  height = 10,
  color = PRIMARY_COLOR,
}) {
  const dispatch = useDispatch();
  const canvas = useRef();
  const meter = useRef();
  const lastValue = useRef(value);
  const reactor = useMemo(() => reactors.getElementById(display.getReactor(name).id), [display]);

  function disableReactor() {
    display.removeReactor(name);
    display.update({ [name]: lastValue.current });

    dispatch(removeReactor(reactor));
    dispatch(setActiveReactorId(null));

    dispatch(loadScenes());
  }

  function toggleReactor() {
    dispatch(setActiveReactorId(reactor.id));
  }

  function draw() {
    const { output } = reactor.getResult();

    meter.current.render(output);
  }

  useEffect(() => {
    meter.current = new CanvasMeter(
      {
        width,
        height,
        color,
      },
      canvas.current,
    );

    events.on('render', draw);

    return () => {
      events.off('render', draw);
    };
  });

  return (
    <div className={styles.reactor}>
      <div className={styles.meter} onDoubleClick={toggleReactor}>
        <canvas ref={canvas} className="canvas" width={width} height={height} />
      </div>
      <Icon
        className={styles.closeIcon}
        glyph={Times}
        title="Disable Reactor"
        onClick={disableReactor}
      />
    </div>
  );
}

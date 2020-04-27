import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import CanvasMeter from 'canvas/CanvasMeter';
import AudioReactor from 'audio/AudioReactor';
import Icon from 'components/interface/Icon';
import { showActiveReactor, hideActiveReactor } from 'actions/app';
import { addReactor, removeReactor } from 'actions/reactors';
import { events, stage } from 'view/global';
import { Flash, Times } from 'view/icons';
import { PRIMARY_COLOR } from 'view/constants';
import styles from './ReactorInput.less';

export default function ReactorInput({
  displayId,
  name,
  value,
  width = 100,
  height = 10,
  color = PRIMARY_COLOR,
  min = 0,
  max = 1,
  children,
}) {
  const dispatch = useDispatch();
  const [reactor, setReactor] = useState();
  const canvas = useRef();
  const meter = useRef();
  const display = useMemo(() => stage.getElementById(displayId), [displayId]);

  async function enableReactor() {
    if (!reactor) {
      const newReactor = await dispatch(
        addReactor(new AudioReactor({ min, max, lastValue: value })),
      );
      setReactor(newReactor);
    }
  }

  function disableReactor() {
    if (reactor) {
      dispatch(removeReactor(reactor));
      dispatch(hideActiveReactor());
    }
  }

  function toggleReactor() {
    if (reactor) {
      dispatch(showActiveReactor(reactor.id));
    }
  }

  function draw() {
    if (reactor) {
      const { output } = reactor.getResult();

      meter.current.render(output);
    }
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
    <>
      <Icon
        className={classNames({
          [styles.icon]: true,
          [styles.iconActive]: reactor,
        })}
        glyph={Flash}
        title={reactor ? 'Show Reactor' : 'Enable Reactor'}
        onClick={enableReactor}
      />
      <div
        className={classNames({
          [styles.reactor]: true,
          [styles.hidden]: !reactor,
        })}
      >
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
      {!reactor && children}
    </>
  );
}

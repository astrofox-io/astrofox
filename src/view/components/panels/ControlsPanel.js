import React, { useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getControlComponent } from 'utils/controls';
import { stage } from 'view/global';
import styles from './ControlsPanel.less';

export default function ControlsPanel() {
  const activeEntityId = useSelector(state => state.app.activeEntityId);
  const { width, height } = useSelector(state => state.stage);
  const scenes = useSelector(state => state.scenes);
  const panelRef = useRef();

  const displays = useMemo(() => {
    return [...stage.scenes].reverse().reduce((arr, scene) => {
      arr.push(scene);
      return arr.concat([...scene.effects].reverse()).concat([...scene.displays].reverse());
    }, []);
  }, [scenes]);

  useEffect(() => {
    const node = document.getElementById(`control-${activeEntityId}`);
    if (node) {
      panelRef.current.scrollTop = node.offsetTop;
    }
  }, [activeEntityId]);

  return (
    <div className={styles.panel} ref={panelRef}>
      {displays.map(display => {
        const { id } = display;
        const Component = getControlComponent(display);

        return (
          <div id={`control-${id}`} key={id} className={styles.control}>
            <Component
              display={display}
              active={id === activeEntityId}
              stageWidth={width}
              stageHeight={height}
            />
          </div>
        );
      })}
    </div>
  );
}

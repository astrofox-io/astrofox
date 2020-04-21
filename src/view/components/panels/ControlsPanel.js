import React, { useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getControlComponent } from 'utils/controls';
import { stage } from 'view/global';
import styles from './ControlsPanel.less';

export default function ControlsPanel() {
  const activeId = useSelector(state => state.app.activeId);
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
    const node = document.getElementById(`control-${activeId}`);
    if (node) {
      panelRef.current.scrollTop = node.offsetTop;
    }
  }, [activeId]);

  return (
    <div className={styles.panel} ref={panelRef}>
      {displays.map(display => {
        const { id } = display;
        const Component = getControlComponent(display);

        return (
          <div id={`control-${id}`} key={id} className={styles.control}>
            <Component
              display={display}
              active={id === activeId}
              stageWidth={width}
              stageHeight={height}
            />
          </div>
        );
      })}
    </div>
  );
}

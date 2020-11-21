import React, { useMemo, useRef, useEffect } from 'react';
import { stage } from 'global';
import Control from 'components/controls/Control';
import useApp from 'actions/app';
import useScenes from 'actions/scenes';
import styles from './ControlsPanel.less';

export default function ControlsPanel() {
  const activeElementId = useApp(state => state.activeElementId);
  const scenes = useScenes(state => state.scenes);
  const panelRef = useRef();

  const displays = useMemo(() => {
    return [...stage.scenes].reverse().reduce((arr, scene) => {
      arr.push(scene);
      return arr.concat([...scene.effects].reverse()).concat([...scene.displays].reverse());
    }, []);
  }, [scenes]);

  useEffect(() => {
    const node = document.getElementById(`control-${activeElementId}`);
    if (node) {
      panelRef.current.scrollTop = node.offsetTop;
    }
  }, [activeElementId]);

  return (
    <div className={styles.panel} ref={panelRef}>
      {displays.map(display => {
        const { id } = display;

        return (
          <div id={`control-${id}`} key={id} className={styles.control}>
            <Control display={display} />
          </div>
        );
      })}
    </div>
  );
}

import React, { useMemo, useRef, useEffect } from 'react';
import shallow from 'zustand/shallow';
import { getControlComponent } from 'utils/controls';
import { stage } from 'view/global';
import useApp from 'actions/app';
import useStage from 'actions/stage';
import useScenes from 'actions/scenes';
import styles from './ControlsPanel.less';

export default function ControlsPanel() {
  const activeElementId = useApp(state => state.activeElementId);
  const [width, height] = useStage(state => [state.width, state.height], shallow);
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
        const Component = getControlComponent(display);

        return (
          <div id={`control-${id}`} key={id} className={styles.control}>
            <Component
              display={display}
              active={id === activeElementId?.id}
              stageWidth={width}
              stageHeight={height}
            />
          </div>
        );
      })}
    </div>
  );
}

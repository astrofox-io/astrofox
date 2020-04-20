import React, { useState, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getControlComponent } from 'utils/controls';
import { stage } from 'view/global';
import styles from './ControlsPanel.less';

export default function ControlsPanel() {
  const { width, height } = useSelector(({ stage }) => stage);
  const scenes = useSelector(state => state.scenes);
  const [activeIndex, setActiveIndex] = useState();
  const panelRef = useRef();

  const displays = useMemo(() => {
    return [...stage.scenes].reverse().reduce((arr, scene) => {
      arr.push(scene);
      return arr.concat([...scene.effects].reverse()).concat([...scene.displays].reverse());
    }, []);
  }, [scenes]);

  /*
  function componentDidUpdate() {
    this.focusControl(this.state.activeIndex);
  }

  function updateControl(display) {
    const control = this.controls[display.id];

    if (control) {
      control.setState(display.properties);
    }
  }

  function focusControl(index) {
    const { displays } = this.state;
    const display = displays[index];

    if (display) {
      const node = this.nodes[display.id];

      if (node) {
        this.nodes.panel.scrollTop = node.offsetTop;

        this.setState({ activeIndex: index });
      }
    }
  }

  function updateState(state) {
    this.setState(state);
  }
  */

  return (
    <div className={styles.panel} ref={panelRef}>
      {displays.map((display, index) => {
        const { id } = display;
        const Component = getControlComponent(display);

        return (
          <div key={id} className={styles.control}>
            <Component
              display={display}
              active={index === activeIndex}
              stageWidth={width}
              stageHeight={height}
            />
          </div>
        );
      })}
    </div>
  );
}

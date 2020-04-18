import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getControlComponent } from 'utils/controls';
import styles from './ControlsPanel.less';

export default function ControlsPanel() {
  const { width, height } = useSelector(({ stage }) => stage);
  const displays = useSelector(state => state.displays);
  const [activeIndex, setActiveIndex] = useState();
  const panelRef = useRef();

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

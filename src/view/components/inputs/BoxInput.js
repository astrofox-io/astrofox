import React, { useRef } from 'react';
import useMouseDrag from 'components/hooks/useMouseDrag';
import { clamp } from 'utils/math.js';
import styles from './BoxInput.less';

export default function BoxInput({
  name = 'box',
  value,
  minWidth = 1,
  minHeight = 1,
  maxWidth = 100,
  maxHeight = 100,
  onChange = () => {},
}) {
  const startDrag = useMouseDrag();
  const { x, y, width, height } = value;

  function handleDrag({ x: dx, y: dy, position, startTop, startLeft, startWidth, startHeight }) {
    const value = { x, y, width, height };

    switch (position) {
      case 'top':
        value.y = clamp(startTop + dy, 0, startTop + startHeight - minHeight);
        value.height = clamp(startHeight - dy, minHeight, startTop + startHeight);
        break;
      case 'right':
        value.width = clamp(startWidth + dx, minWidth, maxWidth - startLeft);
        break;
      case 'bottom':
        value.height = clamp(startHeight + dy, minHeight, maxHeight - startTop);
        break;
      case 'left':
        value.x = clamp(startLeft + dx, 0, startLeft + startWidth - minWidth);
        value.width = clamp(startWidth - dx, minWidth, startLeft + startWidth);
        break;
      case 'center':
        value.x = clamp(startLeft + dx, 0, maxWidth - startWidth);
        value.y = clamp(startTop + dy, 0, maxHeight - startHeight);
        break;
    }

    onChange(name, value);
  }

  const handleDragStart = position => e => {
    startDrag(e, {
      onDrag: handleDrag,
      position,
      startWidth: width,
      startHeight: height,
      startLeft: x,
      startTop: y,
    });
  };

  return (
    <div
      className={styles.box}
      style={{
        width,
        height,
        top: y,
        left: x,
      }}
    >
      <div className={styles.center} onMouseDown={handleDragStart('center')} />
      <div className={styles.top} onMouseDown={handleDragStart('top')} />
      <div className={styles.right} onMouseDown={handleDragStart('right')} />
      <div className={styles.bottom} onMouseDown={handleDragStart('bottom')} />
      <div className={styles.left} onMouseDown={handleDragStart('left')} />
    </div>
  );
}

import React from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import { clamp } from 'utils/math';
import { DotsHorizontal } from 'view/icons';
import styles from './Splitter.less';
import useMouseDrag from '../hooks/useMouseDrag';

export default function Splitter({ panel, type = 'horizontal' }) {
  const startDrag = useMouseDrag();

  function handleDrag({ x, y, startWidth, startHeight }) {
    const { width, height, minWidth, minHeight, maxWidth, maxHeight } = panel.getSize();

    let newWidth = width;
    let newHeight = height;

    switch (type) {
      case 'horizontal':
        newHeight = clamp(startHeight + y, minHeight, maxHeight);
        break;

      case 'vertical':
        newWidth = clamp(startWidth + x, minWidth, maxWidth);
        break;
    }

    panel.setSize(newWidth, newHeight);
  }

  function handleDragStart(e) {
    const { width, height } = panel.getSize();

    startDrag(e, { onDrag: handleDrag, startWidth: width, startHeight: height });
  }

  return (
    <div
      className={classNames({
        [styles.splitter]: true,
        [styles.vertical]: type === 'vertical',
        [styles.horizontal]: type !== 'vertical',
      })}
      onMouseDown={handleDragStart}
    >
      <Icon className={styles.grip} glyph={DotsHorizontal} />
    </div>
  );
}

import React, { useState } from 'react';
import classNames from 'classnames';
import Splitter from 'components/layout/Splitter';
import styles from './Panel.less';

export default function Panel({
  title,
  direction = 'vertical',
  stretch = false,
  resizable = false,
  width: initialWidth = null,
  height: initialHeight = null,
  minHeight = 0,
  minWidth = 0,
  maxWidth,
  maxHeight,
  className,
  children,
}) {
  const [state, setState] = useState({ width: initialWidth, height: initialHeight });
  const { width, height } = state;

  function handleResize(width, height) {
    setState({ width, height });
  }

  return (
    <div
      className={classNames(
        {
          [styles.panel]: true,
          [styles.vertical]: direction === 'vertical',
          [styles.horizontal]: direction !== 'vertical',
          [styles.stretch]: stretch,
        },
        className,
      )}
      style={{ width, height }}
    >
      {title && (
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>{' '}
        </div>
      )}
      {children}
      {resizable && (
        <Splitter
          type="horizontal"
          width={width}
          height={height}
          minWidth={minWidth}
          minHeight={minHeight}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          onResize={handleResize}
        />
      )}
    </div>
  );
}

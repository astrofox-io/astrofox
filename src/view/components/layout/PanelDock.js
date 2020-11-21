import React from 'react';
import classNames from 'classnames';
import Panel from 'components/layout/Panel';
import { mapChildren } from 'utils/react';
import useMeasure from 'hooks/useMeasure';
import styles from './PanelDock.less';

export default function PanelDock({
  direction = 'vertical',
  side = 'right',
  width,
  height,
  visible = true,
  children,
}) {
  const [ref, { width: maxWidth, height: maxHeight }] = useMeasure();

  function handleClone(child, props) {
    if (child.type === Panel) {
      return [child, { ...props }];
    }
    return null;
  }

  return (
    <div
      ref={ref}
      className={classNames(styles.dock, {
        [styles.vertical]: direction === 'vertical',
        [styles.horizontal]: direction !== 'vertical',
        [styles.top]: side === 'top',
        [styles.right]: side === 'right',
        [styles.bottom]: side === 'bottom',
        [styles.left]: side === 'left',
        [styles.hidden]: !visible,
      })}
      style={{
        width,
        height,
      }}
    >
      {mapChildren(children, { maxWidth, maxHeight }, handleClone)}
    </div>
  );
}

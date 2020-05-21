import React from 'react';
import classNames from 'classnames';
import useWindowState from 'components/hooks/useWindowState';
import { closeWindow, maximizeWindow, minimizeWindow } from 'utils/window';
import styles from './WindowButtons.less';

export default function WindowButtons() {
  const { focused, maximized } = useWindowState();

  return (
    <div className={classNames(styles.buttons, { [styles.focused]: focused })}>
      <div className={classNames(styles.button, styles.minimize)} onClick={minimizeWindow} />
      <div
        className={classNames(styles.button, {
          [styles.maximize]: !maximized,
          [styles.restore]: maximized,
        })}
        onClick={maximizeWindow}
      />
      <div className={classNames(styles.button, styles.close)} onClick={closeWindow} />
    </div>
  );
}

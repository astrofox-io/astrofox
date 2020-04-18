import React, { useEffect } from 'react';
import classNames from 'classnames';
import { env } from 'view/global';
import Icon from 'components/interface/Icon';
import useForceUpdate from 'components/hooks/useForceUpdate';
import { getWindow, maximizeWindow, minimizeWindow, closeWindow } from 'utils/window';
import appIcon from 'assets/logo.svg';
import buttonMinimize from 'assets/images/button-minimize.gif';
import buttonMaximize from 'assets/images/button-maximize.gif';
import buttonClose from 'assets/images/button-close.gif';
import buttonRestore from 'assets/images/button-restore.gif';
import styles from './Titlebar.less';

export default function TitleBar() {
  const win = getWindow();
  const icon = win.isMaximized() ? buttonRestore : buttonMaximize;
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    win.on('maximize', forceUpdate);
    win.on('unmaximize', forceUpdate);
    win.on('focus', forceUpdate);
    win.on('blur', forceUpdate);

    return () => {
      win.off('maximize', forceUpdate);
      win.off('unmaximize', forceUpdate);
      win.off('focus', forceUpdate);
      win.off('blur', forceUpdate);
    };
  });

  return (
    <div
      className={classNames({
        [styles.titlebar]: true,
        [styles.isFocused]: win.isFocused(),
        [styles.macOS]: env.IS_MACOS,
      })}
    >
      <Icon className={styles.icon} glyph={appIcon} />
      <div className={styles.title}>{env.APP_NAME}</div>
      <div className={styles.buttons}>
        <span className={styles.button} onClick={minimizeWindow}>
          <img src={buttonMinimize} alt="" />
        </span>
        <span className={styles.button} onClick={maximizeWindow}>
          <img src={icon} alt="" />
        </span>
        <span className={styles.button} onClick={closeWindow}>
          <img src={buttonClose} alt="" />
        </span>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import classNames from 'classnames';
import { env } from 'view/global';
import Icon from 'components/interface/Icon';
import useForceUpdate from 'components/hooks/useForceUpdate';
import { getWindow, maximizeWindow, minimizeWindow, closeWindow } from 'utils/window';
import appIcon from 'assets/logo.svg';
import styles from './Titlebar.less';

export default function TitleBar() {
  const win = getWindow();
  const maximizeClass = win.isMaximized() ? styles.restore : styles.maximize;
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
        <div className={classNames(styles.button, styles.minimize)} onClick={minimizeWindow} />
        <div className={classNames(styles.button, maximizeClass)} onClick={maximizeWindow} />
        <div className={classNames(styles.button, styles.close)} onClick={closeWindow} />
      </div>
    </div>
  );
}

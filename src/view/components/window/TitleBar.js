import React from 'react';
import classNames from 'classnames';
import { env } from 'view/global';
import MenuBar from 'components/nav/MenuBar';
import Icon from 'components/interface/Icon';
import WindowButtons from 'components/window/WindowButtons';
import useWindowState from 'hooks/useWindowState';
import { handleMenuAction } from 'actions/app';
import appIcon from 'view/assets/logo.svg';
import menuConfig from 'config/menu.json';
import styles from './TitleBar.less';

export default function TitleBar() {
  const { focused, maximized } = useWindowState();

  return (
    <div
      className={classNames(styles.titlebar, {
        [styles.focused]: focused,
      })}
    >
      <div className={styles.title}>{env.APP_NAME}</div>
      {!env.IS_MACOS && (
        <>
          <Icon className={styles.icon} glyph={appIcon} />
          <MenuBar items={menuConfig} onMenuAction={handleMenuAction} focused={focused} />
          <WindowButtons focused={focused} maximized={maximized} />
        </>
      )}
    </div>
  );
}

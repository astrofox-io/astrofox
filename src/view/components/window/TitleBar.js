import React from 'react';
import classNames from 'classnames';
import { env } from 'view/global';
import MenuBar from 'components/nav/MenuBar';
import Icon from 'components/interface/Icon';
import WindowButtons from 'components/window/WindowButtons';
import useWindowState from 'components/hooks/useWindowState';
import appIcon from 'view/assets/logo.svg';
import menuConfig from 'config/menu.json';
import styles from './TitleBar.less';

export default function TitleBar({ onMenuAction }) {
  const { focused, maximized } = useWindowState();

  return (
    <div
      className={classNames(styles.titlebar, {
        [styles.focused]: focused,
      })}
    >
      <div className={styles.title}>{env.APP_NAME}</div>
      {!env.IS_MAC && (
        <>
          <Icon className={styles.icon} glyph={appIcon} />
          <MenuBar items={menuConfig} onMenuAction={onMenuAction} focused={focused} />
          <WindowButtons focused={focused} maximized={maximized} />
        </>
      )}
    </div>
  );
}

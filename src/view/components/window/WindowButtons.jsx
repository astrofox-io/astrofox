import React from 'react';
import classNames from 'classnames';
import { api } from 'view/global';
import styles from './WindowButtons.module.less';

export default function WindowButtons({ focused, maximized }) {
  function minimize() {
    api.minimizeWindow();
  }

  function maximize() {
    api.maximizeWindow();
  }

  function close() {
    api.closeWindow();
  }

  return (
    <div className={classNames(styles.buttons, { [styles.focused]: focused })}>
      <div className={classNames(styles.button, styles.minimize)} onClick={minimize} />
      <div
        className={classNames(styles.button, {
          [styles.maximize]: !maximized,
          [styles.restore]: maximized,
        })}
        onClick={maximize}
      />
      <div className={classNames(styles.button, styles.close)} onClick={close} />
    </div>
  );
}

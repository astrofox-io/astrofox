import React from 'react';
import classNames from 'classnames';
import { api } from 'view/global';
import styles from './WindowButtons.less';

export default function WindowButtons({ focused, maximized }) {
  return (
    <div className={classNames(styles.buttons, { [styles.focused]: focused })}>
      <div
        className={classNames(styles.button, styles.minimize)}
        onClick={() => api.minimizeWindow()}
      />
      <div
        className={classNames(styles.button, {
          [styles.maximize]: !maximized,
          [styles.restore]: maximized,
        })}
        onClick={() => api.maximizeWindow()}
      />
      <div className={classNames(styles.button, styles.close)} onClick={() => api.closeWindow()} />
    </div>
  );
}

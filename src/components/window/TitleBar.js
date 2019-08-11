import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import { getWindow, maximizeWindow, minimizeWindow, closeWindow } from 'utils/window';
import appIcon from 'svg/logo.svg';
import buttonMinimize from 'images/view/button-minimize.gif';
import buttonMaximize from 'images/view/button-maximize.gif';
import buttonClose from 'images/view/button-close.gif';
import buttonRestore from 'images/view/button-restore.gif';
import styles from './Titlebar.less';

export default class TitleBar extends PureComponent {
  componentDidMount() {
    const win = getWindow();

    win.on('maximize', () => this.forceUpdate());
    win.on('unmaximize', () => this.forceUpdate());
    win.on('focus', () => this.forceUpdate());
    win.on('blur', () => this.forceUpdate());
  }

  render() {
    const { macOS } = this.props;
    const win = getWindow();
    const icon = win.isMaximized() ? buttonRestore : buttonMaximize;

    return (
      <div
        className={classNames({
          [styles.titlebar]: true,
          [styles.isFocused]: win.isFocused(),
          [styles.macOS]: macOS,
        })}
      >
        <Icon className={styles.icon} glyph={appIcon} />
        <div className={styles.title}>ASTROFOX</div>
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
}

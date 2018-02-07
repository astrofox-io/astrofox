import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import Window from 'core/Window';
import appIcon from 'svg/logo.svg';
import buttonMinimize from 'images/browser/button-minimize.gif';
import buttonMaximize from 'images/browser/button-maximize.gif';
import buttonClose from 'images/browser/button-close.gif';
import buttonRestore from 'images/browser/button-restore.gif';

import styles from './Titlebar.less';

export default class TitleBar extends PureComponent {
    componentDidMount() {
        Window.on('maximize', () => this.forceUpdate());
        Window.on('unmaximize', () => this.forceUpdate());
        Window.on('focus', () => this.forceUpdate());
        Window.on('blur', () => this.forceUpdate());
    }

    onMinimize = (e) => {
        e.preventDefault();
        e.stopPropagation();

        Window.minimize();
    }

    onMaximize = (e) => {
        e.preventDefault();
        e.stopPropagation();

        Window.maximize();
    }

    onClose = (e) => {
        e.preventDefault();
        e.stopPropagation();

        Window.close(true);
    }

    render() {
        const win = Window.getWindow(),
            icon = win.isMaximized() ? buttonRestore : buttonMaximize;

        return (
            <div
                className={
                    classNames({
                        [styles.titlebar]: true,
                        [styles.isFocused]: win.isFocused(),
                    })
                }
            >
                <Icon className={styles.icon} glyph={appIcon} />
                <div className= {styles.title}>ASTROFOX</div>
                <div className={styles.buttons}>
                    <span className={styles.button} onClick={this.onMinimize}>
                        <img src={buttonMinimize} />
                    </span>
                    <span className={styles.button} onClick={this.onMaximize}>
                        <img src={icon} />
                    </span>
                    <span className={styles.button} onClick={this.onClose}>
                        <img src={buttonClose} />
                    </span>
                </div>
            </div>
        );
    }
}
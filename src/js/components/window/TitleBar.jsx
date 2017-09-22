import React from 'react';
import classNames from 'classnames';

import UIComponent from 'components/UIComponent';
import Window from 'core/Window';

import appIcon from 'images/browser/app/icon.png';
import minimizeButton from 'images/browser/buttons/minimize.gif';
import maximizeButton from 'images/browser/buttons/maximize.gif';
import closeButton from 'images/browser/buttons/close.gif';
import restoreButton from 'images/browser/buttons/restore.gif';

export default class TitleBar extends UIComponent {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        Window.on('maximize', () => this.forceUpdate());
        Window.on('unmaximize', () => this.forceUpdate());
        Window.on('focus', () => this.forceUpdate());
        Window.on('blur', () => this.forceUpdate());
    }

    onMinimize(e) {
        e.preventDefault();
        e.stopPropagation();

        Window.minimize();
    }

    onMaximize(e) {
        e.preventDefault();
        e.stopPropagation();

        Window.maximize();
    }

    onClose(e) {
        e.preventDefault();
        e.stopPropagation();

        Window.close(true);
    }

    onConsole(e) {
        e.preventDefault();
        e.stopPropagation();

        Window.openDevTools();
    }

    onReload(e) {
        e.preventDefault();
        e.stopPropagation();

        Window.reload();
    }

    render() {
        let win = Window.getWindow(),
            icon = win.isMaximized() ? restoreButton : maximizeButton,
            classes = {
                'titlebar': true,
                'is-focused': win.isFocused()
            };

        return (
            <div className={classNames(classes)}>
                <div className="icon"><img src={appIcon} width="16" /></div>
                <div className="title">ASTROFOX</div>
                <div className="window-buttons">
                    <span className="button" onClick={this.onMinimize}>
                        <img src={minimizeButton} />
                    </span>
                    <span className="button" onClick={this.onMaximize}>
                        <img src={icon} />
                    </span>
                    <span className="button" onClick={this.onClose}>
                        <img src={closeButton} />
                    </span>
                </div>
            </div>
        );
    }
}
import React from 'react';
import classNames from 'classnames';

import UIComponent from 'components/UIComponent';
import Window from 'core/Window';
import Icon from 'components/interface/Icon';

import appIcon from 'svg/logo.svg';
import buttonMinimize from 'images/browser/button-minimize.gif';
import buttonMaximize from 'images/browser/button-maximize.gif';
import buttonClose from 'images/browser/button-close.gif';
import buttonRestore from 'images/browser/button-restore.gif';

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
            icon = win.isMaximized() ? buttonRestore : buttonMaximize,
            classes = {
                'titlebar': true,
                'is-focused': win.isFocused()
            };

        return (
            <div className={classNames(classes)}>
                <Icon className="icon" glyph={appIcon} />
                <div className="title">ASTROFOX</div>
                <div className="window-buttons">
                    <span className="button" onClick={this.onMinimize}>
                        <img src={buttonMinimize} />
                    </span>
                    <span className="button" onClick={this.onMaximize}>
                        <img src={icon} />
                    </span>
                    <span className="button" onClick={this.onClose}>
                        <img src={buttonClose} />
                    </span>
                </div>
            </div>
        );
    }
}
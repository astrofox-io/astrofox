import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import Window from '../../core/Window';

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
            icon = win.isMaximized() ? 'restore' : 'maximize',
            classes = {
                'titlebar': true,
                'is-focused': win.isFocused()
            };

        return (
            <div className={classNames(classes)}>
                <div className="icon"><img src="./images/icon.png" width="16" /></div>
                <div className="title">ASTROFOX</div>
                <div className="window-buttons">
                    <span className="button" onClick={this.onMinimize}>
                        <img src="./images/buttons/minimize.gif" />
                    </span>
                    <span className="button" onClick={this.onMaximize}>
                        <img src={`./images/buttons/${icon}.gif`} />
                    </span>
                    <span className="button" onClick={this.onClose}>
                        <img src="./images/buttons/close.gif" />
                    </span>
                </div>
            </div>
        );
    }
}
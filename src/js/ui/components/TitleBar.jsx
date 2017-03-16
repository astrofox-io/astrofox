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
        Window.onMaximize(() => this.forceUpdate());
        Window.onUnmaximize(() => this.forceUpdate());
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
        let classes = {
            'button': true,
            'icon-restore': Window.isMaximized(),
            'icon-maximize': !Window.isMaximized()
        };

        return (
            <div className="titlebar">
                <div className="icon"><img src="images/icon.png" width="16" /></div>
                <div className="title">ASTROFOX</div>
                <div className="window-buttons">
                    <span className="button icon-subtract" onClick={this.onMinimize} />
                    <span className={classNames(classes)} onClick={this.onMaximize} />
                    <span className="button icon-multiply" onClick={this.onClose} />
                </div>
            </div>
        );
    }
}
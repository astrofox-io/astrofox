import React from 'react';

import UIComponent from '../UIComponent';
import Window from '../../core/Window';

export default class Header extends UIComponent {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate() {
        return false;
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
        return (
            <div id="header">
                <div className="icon"><img src="images/icon.png" width="16" /></div>
                <div className="title">ASTROFOX</div>
                <div className="window-buttons">
                    <span className="button icon-code" onClick={this.onConsole} />
                    <span className="button icon-cw" onClick={this.onReload} />
                    <span className="button icon-minus" onClick={this.onMinimize} />
                    <span className="button icon-plus" onClick={this.onMaximize} />
                    <span className="button icon-cross" onClick={this.onClose} />
                </div>
            </div>
        );
    }
}
import React from 'react';

import UIComponent from '../UIComponent';
import Window from '../../core/Window';

export default class TitleBar extends UIComponent {
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
        let devButtons = [];

        if (!__PROD__) {
            devButtons.push(<span key={0} className="button icon-code" onClick={this.onConsole} />);
            devButtons.push(<span key={1} className="button icon-cw" onClick={this.onReload} />);
        }

        return (
            <div className="titlebar">
                <div className="icon"><img src="images/icon.png" width="16" /></div>
                <div className="title">ASTROFOX</div>
                <div className="window-buttons">
                    {devButtons}
                    <span className="button icon-minus" onClick={this.onMinimize} />
                    <span className="button icon-plus" onClick={this.onMaximize} />
                    <span className="button icon-cross" onClick={this.onClose} />
                </div>
            </div>
        );
    }
}
'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const Window = require('../../core/Window');

class Header extends UIComponent {
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
                    <ul>
                        <li className="button icon-code" onClick={this.onConsole} />
                        <li className="button icon-cw" onClick={this.onReload} />
                        <li className="button icon-minus" onClick={this.onMinimize} />
                        <li className="button icon-plus" onClick={this.onMaximize} />
                        <li className="button icon-cross" onClick={this.onClose} />
                    </ul>
                </div>
            </div>
        );
    }
}

module.exports = Header;
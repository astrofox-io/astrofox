'use strict';

const React = require('react');

const Window = require('../../core/Window.js');
const autoBind = require('../../util/autoBind.js');

class Header extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
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
                <div className="icon"><img src="resources/images/icon.png" /></div>
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
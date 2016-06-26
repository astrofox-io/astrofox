'use strict';

const React = require('react');
const Window = require('../../Window.js');
const autoBind = require('../../util/autoBind.js');

class Header extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }
    
    componentDidMount() {
        this.window = Window;
    }

    shouldComponentUpdate() {
        return false;
    }

    handleMinimize(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.minimize();
    }

    handleMaximize(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.maximize();
    }

    handleClose(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.close(true);
    }

    handleConsole(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.openDevTools();
    }

    handleReload(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.reload();
    }

    render() {
        return (
            <div id="header">
                <div className="icon"><img src="resources/images/icon.png" /></div>
                <div className="title">ASTROFOX</div>
                <div className="window-buttons">
                    <ul>
                        <li className="button icon-code" onClick={this.handleConsole} />
                        <li className="button icon-cw" onClick={this.handleReload} />
                        <li className="button icon-minus" onClick={this.handleMinimize} />
                        <li className="button icon-plus" onClick={this.handleMaximize} />
                        <li className="button icon-cross" onClick={this.handleClose} />
                    </ul>
                </div>
            </div>
        );
    }
}

module.exports = Header;
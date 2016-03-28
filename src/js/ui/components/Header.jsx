'use strict';

var React = require('react');
var Window = require('../../Window.js');

var Header = React.createClass({
    componentDidMount: function() {
        this.window = Window;
    },

    shouldComponentUpdate: function() {
        return false;
    },

    handleMinimize: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.minimize();
    },

    handleMaximize: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.maximize();
    },

    handleClose: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.close(true);
    },

    handleConsole: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.openDevTools();
    },

    handleReload: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.window.reload();
    },


    render: function() {
        return (
            <div id="header">
                <div className="icon"><img src="resources/images/icon.png" /></div>
                <div className="title">ASTROFOX</div>
                <div className="window-buttons">
                    <ul>
                        <li className="button icon-code" onClick={this.handleConsole}></li>
                        <li className="button icon-cw" onClick={this.handleReload}></li>
                        <li className="button icon-minus" onClick={this.handleMinimize}></li>
                        <li className="button icon-plus" onClick={this.handleMaximize}></li>
                        <li className="button icon-cross" onClick={this.handleClose}></li>
                    </ul>
                </div>
            </div>
        );
    }
});

module.exports = Header;
'use strict';

var React = require('react');
var App = require('./ui/App.jsx');
var GUI = global.window.require('nw.gui');

var AstroFox = {};

AstroFox.version = '1.0';

AstroFox.start = function() {
    // NW.js
    var win = GUI.Window.get();
    win.showDevTools();

    // OSX
    if (global.process.platform === 'darwin') {
        var mb = new GUI.Menu({ type: 'menubar' });
        mb.createMacBuiltin('AstroFox');
        win.menu = mb;
    }

    // Render UI
    React.render(
        React.createElement(App, null),
        document.getElementById("app")
    );
};

module.exports = AstroFox;
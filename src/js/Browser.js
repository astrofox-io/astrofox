'use strict';

var Browser = {
    init: function() {
        // NW.js
        if (global.__nw_require) {
            var GUI = global.window.require('nw.gui');

            var win = this.Window = GUI.Window.get();
            win.showDevTools();

            // OSX
            if (global.process.platform === 'darwin') {
                var mb = new GUI.Menu({type: 'menubar'});
                mb.createMacBuiltin('AstroFox');
                win.menu = mb;
            }
        }
    }
};

var NWWindow = function(window) {
    this.window = window;
};

NWWindow.prototype = {
    constructor: NWWindow,

    maximize: function() {
        this.window.maximize();
    },

    minimize: function() {
        this.window.minimize();
    },

    unmaximize: function() {
        this.window.unmaximize();
    },

    showDevTools: function() {
        this.window.showDevTools();
    },

    reload: function() {
        this.window.reload();
    }
};

module.exports = Browser;
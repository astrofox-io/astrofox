'use strict';

var Browser = {
    init: function() {
        var win;

        // NW.js
        if (global.__nw_require) {
            var GUI = global.require('nw.gui');

            win = GUI.Window.get();
            win.showDevTools();

            this.Window = new NWJS(win);

            // OSX
            if (global.process.platform === 'darwin') {
                var mb = new GUI.Menu({type: 'menubar'});
                mb.createMacBuiltin('AstroFox');
                win.menu = mb;
            }
        }
        // Electron
        else {
            var remote = global.require('remote');

            win = remote.getCurrentWindow();
            win.openDevTools({ detach: true });

            this.Window = new Electron(win);
        }
    }
};

var NWJS = function(window) {
    this.window = window;
};

NWJS.prototype = {
    constructor: NWJS,

    maximize: function() {
        this.window.maximize();
    },

    minimize: function() {
        this.window.minimize();
    },

    unmaximize: function() {
        this.window.unmaximize();
    },

    openDevTools: function() {
        this.window.showDevTools();
    },

    reload: function() {
        this.window.reload();
    },

    close: function() {
        this.window.close();
    }
};

var Electron = function(window) {
    this.window = window;
};

Electron.prototype = {
    constructor: Electron,

    maximize: function() {
        this.window.maximize();
    },

    minimize: function() {
        this.window.minimize();
    },

    unmaximize: function() {
        this.window.unmaximize();
    },

    openDevTools: function() {
        this.window.openDevTools({ detach: true });
    },

    reload: function() {
        this.window.reload();
    },

    close: function() {
        this.window.close();
    }
};

module.exports = Browser;
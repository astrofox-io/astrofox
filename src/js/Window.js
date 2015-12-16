'use strict';

const remote = global.require('electron').remote;

var Window = {
    init: function() {
        this.window = remote.getCurrentWindow();

        this.openDevTools();
    },

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

module.exports = Window;
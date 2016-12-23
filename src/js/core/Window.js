'use strict';

const remote = window.require('electron').remote;

class Window {
    constructor() {
        this.win = remote.getCurrentWindow();
        this.dialog = remote.dialog;
    }

    maximize() {
        if (this.win.isMaximized()) {
            this.unmaximize();
        }
        else {
            this.win.maximize();
        }
    }

    minimize() {
        this.win.minimize();
    }

    unmaximize() {
        this.win.unmaximize();
    }

    openDevTools() {
        this.win.openDevTools({ detach: true });
    }

    reload() {
        this.win.reload();
    }

    close() {
        this.win.close();
    }

    showOpenDialog(callback, options) {
        this.dialog.showOpenDialog(this.win, options, callback);
    }

    showSaveDialog(callback, options) {
        this.dialog.showSaveDialog(this.win, options, callback);
    }

    showMessageBox(title, message, options) {
        this.dialog.showMessageBox(
            this.win,
            Object.assign({ title: title, message: message, buttons: [] }, options)
        );
    }

    showErrorBox(title, content) {
        this.dialog.showErrorBox(title, content);
    }
}

module.exports = new Window;
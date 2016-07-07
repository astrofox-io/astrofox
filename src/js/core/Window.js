'use strict';

const remote = window.require('electron').remote;
const dialog = remote.dialog;

class Window {
    constructor() {
        this.window = remote.getCurrentWindow();
    }

    maximize() {
        if (this.window.isMaximized()) {
            this.unmaximize();
        }
        else {
            this.window.maximize();
        }
    }

    minimize() {
        this.window.minimize();
    }

    unmaximize() {
        this.window.unmaximize();
    }

    openDevTools() {
        this.window.openDevTools({ detach: true });
    }

    reload() {
        this.window.reload();
    }

    close() {
        this.window.close();
    }

    showOpenDialog(action) {
        dialog.showOpenDialog(this.window, action);
    }

    showSaveDialog(path, action) {
        dialog.showSaveDialog(this.window, { defaultPath: path }, action);
    }
}

module.exports = new Window;
'use strict';

const remote = window.require('electron').remote;

class Window {
    constructor() {
    }

    maximize() {
        let win = remote.getCurrentWindow();

        if (win.isMaximized()) {
            this.unmaximize();
        }
        else {
            win.maximize();
        }
    }

    minimize() {
        remote.getCurrentWindow().minimize();
    }

    unmaximize() {
        remote.getCurrentWindow().unmaximize();
    }

    openDevTools() {
        remote.getCurrentWindow().openDevTools({ detach: true });
    }

    reload() {
        remote.getCurrentWindow().reload();
    }

    close() {
        remote.getCurrentWindow().close();
    }

    showOpenDialog(action) {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), action);
    }

    showSaveDialog(path, action) {
        remote.dialog.showSaveDialog(remote.getCurrentWindow(), { defaultPath: path }, action);
    }

    showErrorBox(title, content) {
        remote.dialog.showErrorBox(title, content);
    }
}

module.exports = new Window;
import { remote } from 'electron';

class Window {
    constructor() {
        this.win = remote.getCurrentWindow();
        this.dialog = remote.dialog;
    }

    getWindow() {
        return this.win;
    }

    on(event, callback) {
        this.win.on(event, callback);
    }

    maximize() {
        if (this.win.isMaximized()) {
            this.unmaximize();
        }
        else {
            this.win.maximize();
        }
    }

    unmaximize() {
        this.win.unmaximize();
    }

    minimize() {
        this.win.minimize();
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
            Object.assign({ title, message, buttons: [] }, options),
        );
    }

    showErrorBox(title, content) {
        this.dialog.showErrorBox(title, content);
    }

    openDevTools() {
        this.win.openDevTools({ detach: true });
    }
}

export default new Window();

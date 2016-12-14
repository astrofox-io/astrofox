const electron = require('electron');
const path = require('path');
const url = require('url');
const debug = require('debug')('astrofox');
const { app, BrowserWindow, globalShortcut } = electron;

if (require('./lib/squirrel')) return;

let win;

function getEnvironment() {
    return process.env.NODE_ENV || 'development';
}

function createWindow() {
    // Create window
    win = new BrowserWindow({
        show: false,
        width: 1320,
        height: 1200,
        minWidth: 200,
        minHeight: 100,
        frame: false,
        backgroundColor: '#222222',
        webPreferences: {
            webSecurity: false,
            webgl: true,
            textAreasAreResizable: false,
            experimentalCanvasFeatures: true,
            backgroundThrottling: false,
            devTools: getEnvironment() === 'development'
        },
        titleBarStyle: 'hidden-inset'
    });

    // Production settings
    if (getEnvironment() !== 'development') {
        // Disable devtools shortcut
        globalShortcut.register('CommandOrControl+Shift+I', () => {
            // Do nothing
        });

        // Auto close devtools if opened
        win.webContents.on('devtools-opened', () => {
            win.webContents.closeDevTools();
        });
    }

    // Load app index
    let index = url.format({
        pathname: path.join(__dirname, 'browser', 'index.html'),
        protocol: 'file',
        slashes: true
    });

    win.loadURL(index);

    win.webContents.on('dom-ready', () => {
        debug('dom ready');
        showWindow();
    });

    // Show window only when ready
    win.on('ready-to-show', () => {
        debug('ready to show window...');
        showWindow();
    });

    // Window close
    win.on('closed', () => {
        win = null;
    });
}

function showWindow() {
    win.show();
}

// Chrome flags
// Hardware acceleration
app.commandLine.appendSwitch('ignore-gpu-blacklist');
//app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');

// WebGL 2
//app.commandLine.appendSwitch('enable-unsafe-es3-apis');

// GPU rasterization
//app.commandLine.appendSwitch('enable-gpu-rasterization');

// Disable background throttling
//app.commandLine.appendSwitch('disable-renderer-background');

// Number of raster threads
//app.commandLine.appendSwitch('num-raster-threads', 4);

// Memory profiling
app.commandLine.appendSwitch('enable-precise-memory-info');

app.on('ready', () => {
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
});
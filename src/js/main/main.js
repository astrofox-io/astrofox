const electron = require('electron');
const path = require('path');
const url = require('url');
const debug = require('debug')('astrofox');
const { app, BrowserWindow, globalShortcut, systemPreferences } = electron;
const squirrel = require('./squirrel');

if (squirrel()) {
    process.exit();
}

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
        debug('dom-ready');
        showWindow();
    });

    // Show window only when ready
    win.on('ready-to-show', () => {
        debug('ready-to-show');
        showWindow();
    });

    // Window close
    win.on('close', () => {
        debug('close');
        win = null;
    });

    win.on('closed', () => {
        debug('closed');
        win = null;
    });
}

function showWindow() {
    win.show();

    debug('register', globalShortcut.register('CmdOrCtrl+R', () => {
        debug('reload');
        win.reload();
    }));

    debug(globalShortcut.isRegistered('CmdOrCtrl+R'));

    if (process.platform === 'darwin') {
        win.webContents.openDevTools();
    }
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
    debug('ready');

    globalShortcut.unregisterAll();

    if (getEnvironment() !== 'development') {
        // Disable devtools shortcut
        globalShortcut.register('CmdOrCtrl+Shift+I', () => {
            // Do nothing
        });
    }

    if (process.platform === 'darwin') {
        systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
        systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
    }

    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    debug('window-all-closed');

    win = null;

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    debug('activate');
    if (win === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    debug('will-quit');
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
});
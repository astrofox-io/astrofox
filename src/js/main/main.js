const electron = require('electron');
const path = require('path');
const url = require('url');
const debug = require('debug')('astrofox');
const { app, BrowserWindow, globalShortcut, systemPreferences } = electron;
const squirrel = require('./squirrel');

if (squirrel()) {
    process.exit();
}

let mainWindow;

function createWindow() {
    // Create window
    mainWindow = new BrowserWindow({
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
            devTools: (process.env.NODE_ENV !== 'production')
        },
        titleBarStyle: 'hidden-inset'
    });

    // Production settings
    if (process.env.NODE_ENV === 'production') {
        // Auto close devtools if opened
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow.webContents.closeDevTools();
        });
    }

    // Load app index
    let index = url.format({
        pathname: path.join(__dirname, 'browser', 'index.html'),
        protocol: 'file',
        slashes: true
    });

    mainWindow.loadURL(index);

    mainWindow.webContents.on('dom-ready', () => {
        debug('dom-ready');
        showWindow();
    });

    // Show window only when ready
    mainWindow.on('ready-to-show', () => {
        debug('ready-to-show');
        showWindow();
    });

    // Window close
    mainWindow.on('close', () => {
        debug('close');
        mainWindow = null;
    });

    mainWindow.on('closed', () => {
        debug('closed');
        mainWindow = null;
    });
}

function showWindow() {
    mainWindow.show();

    if (process.env.NODE_ENV !== 'production') {
        mainWindow.webContents.openDevTools();
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

    // Disable menu item on macOS
    if (process.platform === 'darwin') {
        systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
        systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
    }

    createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    debug('window-all-closed');

    mainWindow = null;

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    debug('activate');
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    debug('will-quit');

    // Unregister all shortcuts
    globalShortcut.unregisterAll();
});
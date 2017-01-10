const electron = require('electron');
const path = require('path');
const url = require('url');
const squirrel = require('./squirrel');
const Logger = require('../core/Logger');
const { app, BrowserWindow, globalShortcut, systemPreferences } = electron;

if (squirrel()) {
    process.exit();
}

let mainWindow = null;
const log = (new Logger()).log;

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

    // Load index page
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'browser', 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    // Show window when DOM ready
    mainWindow.webContents.on('dom-ready', () => {
        log('dom-ready');
        showWindow();
    });

    // Show window only when ready
    mainWindow.on('ready-to-show', () => {
        log('ready-to-show');
        showWindow();
    });

    // Window close
    mainWindow.on('close', () => {
        log('close');
        mainWindow = null;
    });

    mainWindow.on('closed', () => {
        log('closed');
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
if (process.env.NODE_ENV !== 'production') {
    app.commandLine.appendSwitch('enable-precise-memory-info');
}

app.on('ready', () => {
    log('ready');

    // Disable menu items on macOS
    if (process.platform === 'darwin') {
        systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
        systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
    }

    createWindow();
});

app.on('window-all-closed', () => {
    log('window-all-closed');

    mainWindow = null;

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    log('activate');

    if (mainWindow === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    log('will-quit');

    globalShortcut.unregisterAll();
});
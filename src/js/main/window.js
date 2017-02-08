import { BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import debug from 'debug';

const log = debug('window');

export let mainWindow = null;

export function createWindow() {
    if (mainWindow !== null) return;

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
            devTools: !__PROD__
        },
        titleBarStyle: 'hidden-inset'
    });

    // Production settings
    if (__PROD__) {
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

export function showWindow() {
    mainWindow.show();

    if (!__PROD__) {
        mainWindow.webContents.openDevTools();
    }
}

export function disposeWindow() {
    mainWindow = null;
}
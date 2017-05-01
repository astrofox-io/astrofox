import { app, globalShortcut, systemPreferences, ipcMain } from 'electron';
import fs from 'fs';
import debug from 'debug';
import * as env from './environment';
import AppUpdater from './autoupdate';
import { createWindow, disposeWindow } from './window';

const log = debug('main');
const appUpdater = new AppUpdater();

// Show environment
log('NODE_ENV', process.env.NODE_ENV);

// Set global variables
global['env'] = env;

// Create temp folder for application
function createTempFolder() {
    try {
        fs.mkdirSync(env.TEMP_PATH);
        log('Temp folder created:', env.TEMP_PATH);
    }
    catch(err) {
        if (err.code !== 'EEXIST') {
            log('ERROR:', err.message);
        }
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

// Application events
app.on('ready', () => {
    log('ready');

    // Disable menu items on macOS
    if (process.platform === 'darwin') {
        systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
        systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
    }

    createTempFolder();

    createWindow();
});

app.on('window-all-closed', () => {
    log('window-all-closed');

    disposeWindow();

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    log('activate');

    createWindow();
});

app.on('will-quit', () => {
    log('will-quit');

    globalShortcut.unregisterAll();
});

// IPC events
ipcMain.on('check-for-updates', event => {
    appUpdater.checkForUpdates().then(result => {
        event.sender.send('check-for-updates-complete', result);
    });
});

ipcMain.on('download-update', event => {
    appUpdater.downloadUpdate().then(result => {
        event.sender.send('download-update-complete', result);
    });
});

ipcMain.on('quit-and-install', () => {
    appUpdater.quitAndInstall();
});
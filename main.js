const electron = require('electron');
// Module to control application life.
const {app, globalShortcut} = electron;
// Module to create native browser window.
const {BrowserWindow} = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function getEnvironment() {
    return process.env.NODE_ENV || 'development';
}

function createWindow() {
    // Create the browser window.
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

    // and load the index.html of the app.
    win.loadURL(`file://${__dirname}/index.html`);

    // Show window only when ready
    win.on('ready-to-show', () => {
        if (getEnvironment() !== 'development') {
            // Disable devtools shortcut
            globalShortcut.register('CommandOrControl+Shift+I', () => {
            });

            // Auto close devtools if opened
            win.webContents.on('devtools-opened', () => {
                win.webContents.closeDevTools();
            });
        }

        win.show();

        // Open the devtools
        if (getEnvironment() === 'development') {
            win.webContents.openDevTools({detach: true});
        }
    });

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
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


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});
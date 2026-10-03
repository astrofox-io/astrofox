const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const [scratch, output] = process.argv.slice(2);
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
let window;
const timeout = setTimeout(() => {
  console.error('Benchmark timed out.');
  app.exit(1);
}, 600000);
ipcMain.on('progress', (_event, message) => console.log(message));
ipcMain.on('snapshot', (_event, { name, data }) => {
  fs.writeFileSync(path.join(output, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
});
ipcMain.on('result', (_event, result) => {
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
  console.log(`Results: ${path.join(output, 'results.json')}`);
  clearTimeout(timeout);
  app.exit(result.error ? 1 : 0);
});
app.whenReady().then(() => {
  window = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    webPreferences: { nodeIntegration: true, contextIsolation: false, backgroundThrottling: false },
  });
  window.webContents.on('render-process-gone', (_event, details) => {
    console.error(details.reason);
    app.exit(1);
  });
  window.loadFile(path.join(scratch, 'index.html'));
});

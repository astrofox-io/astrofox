import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { app, BrowserWindow, ipcMain, net, protocol, session, shell } from 'electron';
import { registerDialogIpc } from './dialogs-ipc.mjs';
import { registerFfmpegIpc } from './ffmpeg-ipc.mjs';
import { PLUGIN_SANDBOX_HEADERS } from './plugin-sandbox-policy.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev =
  process.env.ELECTRON_DEV === '1' || process.env.NODE_ENV === 'development' || !app.isPackaged;

const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;
const WINDOW_MIN_WIDTH = 800;
const WINDOW_MIN_HEIGHT = 600;
const WINDOW_BGCOLOR = '#171717';
const DEV_SERVER_URL =
  process.env.ELECTRON_START_URL || `http://localhost:${process.env.PORT || 3000}`;

/** @type {BrowserWindow | null} */
let mainWindow = null;

// Must be registered before app is ready.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'astrofox',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      allowServiceWorkers: true,
    },
  },
  {
    scheme: 'astrofox-media',
    privileges: {
      standard: true,
      secure: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function getRendererRoot() {
  // electron/ is next to out/ in both dev and the packaged asar layout.
  return path.join(__dirname, '..', 'out');
}

function getFfmpegBinaryPath() {
  const binaryName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bin', binaryName);
  }
  return path.join(__dirname, '..', 'bin', binaryName);
}

function getTempPath() {
  return path.join(app.getPath('temp'), 'Astrofox');
}

function getDesktopEnvironment() {
  return {
    APP_NAME: 'Astrofox',
    APP_VERSION: app.getVersion(),
    IS_DESKTOP: true,
    IS_PACKAGED: app.isPackaged,
    OS_PLATFORM: process.platform,
    USER_DATA_PATH: app.getPath('userData'),
    TEMP_PATH: getTempPath(),
    FFMPEG_PATH: getFfmpegBinaryPath(),
    FFMPEG_AVAILABLE: fs.existsSync(getFfmpegBinaryPath()),
    ELECTRON_VERSION: process.versions.electron,
    CHROME_VERSION: process.versions.chrome,
    USER_AGENT: [
      `Astrofox/${app.getVersion()} (${process.platform})`,
      `Chrome/${process.versions.chrome}`,
      `Electron/${process.versions.electron}`,
    ].join(' '),
  };
}

function getWindowState() {
  if (!mainWindow) {
    return { focused: false, maximized: false, minimized: false };
  }
  return {
    focused: mainWindow.isFocused(),
    maximized: mainWindow.isMaximized(),
    minimized: mainWindow.isMinimized(),
  };
}

function sendWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('window-state-changed', getWindowState());
}

function registerIpc() {
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return getWindowState();
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return getWindowState();
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:get-state', () => getWindowState());

  ipcMain.handle('desktop:get-environment', () => getDesktopEnvironment());

  ipcMain.handle('desktop:open-path', async (_event, targetPath) => {
    if (typeof targetPath !== 'string' || !targetPath) {
      throw new Error('Invalid path');
    }
    return shell.openPath(targetPath);
  });

  ipcMain.handle('desktop:show-item-in-folder', (_event, targetPath) => {
    if (typeof targetPath !== 'string' || !targetPath) {
      throw new Error('Invalid path');
    }
    shell.showItemInFolder(targetPath);
  });

  registerDialogIpc(ipcMain, () => mainWindow);
  registerFfmpegIpc(ipcMain, {
    getFfmpegPath: getFfmpegBinaryPath,
    getTempPath,
  });
}

function registerAppProtocol() {
  const rendererRoot = getRendererRoot();

  protocol.handle('astrofox', async request => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);

    if (!pathname || pathname === '/') {
      pathname = '/index.html';
    }

    // Prevent path traversal.
    const relative = pathname.replace(/^\/+/, '');
    const filePath = path.normalize(path.join(rendererRoot, relative));
    if (!filePath.startsWith(path.normalize(rendererRoot))) {
      return new Response('Forbidden', { status: 403 });
    }

    let resolved = filePath;
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      resolved = path.join(resolved, 'index.html');
    }

    if (!fs.existsSync(resolved)) {
      // SPA-style fallback for client routes.
      const fallback = path.join(rendererRoot, 'index.html');
      if (fs.existsSync(fallback)) {
        return net.fetch(pathToFileURL(fallback).href);
      }
      return new Response('Not Found', { status: 404 });
    }

    const response = await net.fetch(pathToFileURL(resolved).href);

    // The plugin sandbox worker is served with a CSP that blocks network
    // access and remote code; keep in sync with the Next headers config.
    const sandbox = PLUGIN_SANDBOX_HEADERS.find(entry => entry.path === pathname);
    if (sandbox) {
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', sandbox.csp);
      return new Response(response.body, { status: response.status, headers });
    }

    return response;
  });
}

function registerMediaProtocol() {
  const videoMimeTypes = new Map([
    ['.mp4', 'video/mp4'],
    ['.webm', 'video/webm'],
    ['.ogv', 'video/ogg'],
  ]);

  function createMediaHeaders(contentType) {
    return new Headers({
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': contentType,
    });
  }

  function parseByteRange(rangeHeader, fileSize) {
    const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
    if (!match || (!match[1] && !match[2])) {
      return null;
    }

    let start;
    let end;

    if (!match[1]) {
      const suffixLength = Number(match[2]);
      if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
        return null;
      }
      start = Math.max(0, fileSize - suffixLength);
      end = fileSize - 1;
    } else {
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : fileSize - 1;
    }

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 0 ||
      start >= fileSize ||
      end < start
    ) {
      return null;
    }

    return {
      start,
      end: Math.min(end, fileSize - 1),
    };
  }

  protocol.handle('astrofox-media', async request => {
    const url = new URL(request.url);
    const targetPath = url.host === 'local' ? url.searchParams.get('path')?.trim() : '';
    const extension = targetPath ? path.extname(targetPath).toLowerCase() : '';
    const contentType = videoMimeTypes.get(extension);

    if (
      !targetPath ||
      !path.isAbsolute(targetPath) ||
      !contentType ||
      !fs.existsSync(targetPath) ||
      !fs.statSync(targetPath).isFile()
    ) {
      return new Response('Media not found', { status: 404 });
    }

    const headers = createMediaHeaders(contentType);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const { size } = fs.statSync(targetPath);
    const rangeHeader = request.headers.get('range');
    const range = rangeHeader ? parseByteRange(rangeHeader, size) : null;

    if (rangeHeader && !range) {
      headers.set('Content-Range', `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const start = range?.start ?? 0;
    const end = range?.end ?? size - 1;
    headers.set('Content-Length', String(Math.max(0, end - start + 1)));

    if (range) {
      headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    }

    const body =
      request.method === 'HEAD'
        ? null
        : Readable.toWeb(fs.createReadStream(targetPath, { start, end }));

    return new Response(body, {
      status: range ? 206 : 200,
      headers,
    });
  });
}

function isAllowedNavigation(url) {
  if (url.startsWith('astrofox://')) {
    return true;
  }
  if (isDev && (url.startsWith(DEV_SERVER_URL) || url.startsWith('devtools://'))) {
    return true;
  }
  return false;
}

// Only grant the capabilities the app actually uses (audio input, screen/system
// audio capture, MIDI, File System Access pickers); everything else is denied so
// content running in the renderer cannot silently acquire it.
const ALLOWED_PERMISSIONS = new Set([
  'media',
  'audioCapture',
  'display-capture',
  'midi',
  'midiSysex',
  'clipboard-sanitized-write',
  'fullscreen',
  // Chromium File System Access API (showOpenFilePicker / showSaveFilePicker).
  'fileSystem',
]);

function hardenSession() {
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(ALLOWED_PERMISSIONS.has(permission));
  });

  // Permission checks (sync) must also allow fileSystem or pickers stay blocked.
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return ALLOWED_PERMISSIONS.has(permission);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    backgroundColor: WINDOW_BGCOLOR,
    show: false,
    frame: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    // Title bar is 48px; y:18 centers the 12px lights. x:16 leaves a left gutter.
    trafficLightPosition: process.platform === 'darwin' ? { x: 16, y: 18 } : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
      webgl: true,
      devTools: true,
    },
  });

  // The app is a single window: navigation away from it and new windows are
  // never legitimate. External links open in the system browser instead.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedNavigation(url)) {
      event.preventDefault();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (isDev) {
      mainWindow?.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Silence the harmless "Request Autofill.* failed" errors that the bundled
  // DevTools frontend logs because Electron doesn't implement that CDP domain.
  mainWindow.webContents.on('console-message', event => {
    const { sourceId = '', message = '' } = event;
    if (sourceId.startsWith('devtools://') && /Autofill\./.test(message)) {
      event.preventDefault();
    }
  });

  mainWindow.on('focus', sendWindowState);
  mainWindow.on('blur', sendWindowState);
  mainWindow.on('maximize', sendWindowState);
  mainWindow.on('unmaximize', sendWindowState);
  mainWindow.on('minimize', sendWindowState);
  mainWindow.on('restore', sendWindowState);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.loadURL(DEV_SERVER_URL);
  } else {
    mainWindow.loadURL('astrofox://app/');
  }
}

app.commandLine.appendSwitch('ignore-gpu-blocklist');

app.whenReady().then(async () => {
  try {
    fs.mkdirSync(getTempPath(), { recursive: true });
  } catch {
    // non-fatal
  }

  registerIpc();
  hardenSession();
  registerMediaProtocol();

  if (!isDev) {
    registerAppProtocol();
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { app, BrowserWindow, dialog, ipcMain, Menu, net, protocol, session, shell } from 'electron';
import { registerDialogIpc } from './dialogs-ipc.mjs';
import { isPathInside, killAllFfmpeg, registerFfmpegIpc } from './ffmpeg-ipc.mjs';
import { PLUGIN_SANDBOX_HEADERS } from './plugin-sandbox-policy.mjs';
import { closeDatabase, isDatabasePersistent, openDatabase } from './storage/db.mjs';
import { registerStorageIpc } from './storage-ipc.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev =
  process.env.ELECTRON_DEV === '1' || process.env.NODE_ENV === 'development' || !app.isPackaged;

// Only one Astrofox instance may run: a second launch focuses the existing
// window instead (this also keeps ffmpeg temp files from colliding).
const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
}

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
    UPDATER_ENABLED: app.isPackaged || Boolean(getFakeUpdateScenario()),
    OS_PLATFORM: process.platform,
    USER_DATA_PATH: app.getPath('userData'),
    STORAGE_PERSISTENT: isDatabasePersistent(),
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

  registerStorageIpc(ipcMain);
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
    if (!isPathInside(rendererRoot, filePath)) {
      return new Response('Forbidden', { status: 403 });
    }

    let resolved = filePath;
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      resolved = path.join(resolved, 'index.html');
    }

    if (!fs.existsSync(resolved)) {
      // SPA-style fallback for client routes.
      const fallback = path.join(rendererRoot, 'index.html');
      if (!fs.existsSync(fallback)) {
        return new Response('Not Found', { status: 404 });
      }
      resolved = fallback;
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

    // Documents get the app-wide CSP (only meaningful on document responses;
    // static assets are left untouched).
    if (/\.html?$/i.test(resolved)) {
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', getDocumentCsp(resolved));
      return new Response(response.body, { status: response.status, headers });
    }

    return response;
  });
}

// Content-Security-Policy for the packaged app document (astrofox://app).
// - scripts: same-origin bundles only. window.eval is deleted by the renderer
//   in production and there is no wasm, so no 'unsafe-eval'. blob: is needed
//   for the Web Workers spawned from bundled code.
// - styles: Tailwind runtime + inline style attributes need 'unsafe-inline'.
// - connect: plugin installs fetch manifests/bundles over https (or localhost).
// - img/media/font: bundled assets, blobs, data URLs and the local
//   astrofox-media: protocol used for video textures.
// The plugin sandbox worker keeps its own, stricter CSP (see above). Not
// applied in dev where the app is served from the Next dev server.
const APP_CSP_DIRECTIVES = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: astrofox-media:",
  "media-src 'self' blob: data: astrofox-media:",
  "font-src 'self' blob: data:",
  // http://localhost is allowed so plugin authors can install from a local dev
  // server (see docs/plugin-authoring.md).
  "connect-src 'self' blob: data: https: http://localhost:* http://127.0.0.1:* astrofox-media:",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
];

/** @type {Map<string, { mtimeMs: number, csp: string }>} */
const documentCspCache = new Map();

/**
 * Build the CSP for an exported HTML document. Next's static export bootstraps
 * hydration with inline `<script>` blocks, so instead of 'unsafe-inline' the
 * SHA-256 of each inline script is allow-listed. The result is cached per
 * file (keyed by mtime); the exported HTML is immutable in a packaged build.
 * @param {string} filePath
 */
function getDocumentCsp(filePath) {
  let mtimeMs = 0;
  try {
    mtimeMs = fs.statSync(filePath).mtimeMs;
  } catch {
    // fall through and rebuild
  }
  const cached = documentCspCache.get(filePath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.csp;
  }

  const hashes = [];
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const scriptPattern = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
    let match = scriptPattern.exec(html);
    while (match) {
      const attrs = match[1] || '';
      const body = match[2];
      if (!/\ssrc\s*=/i.test(attrs) && body.length > 0) {
        const digest = createHash('sha256').update(body, 'utf8').digest('base64');
        hashes.push(`'sha256-${digest}'`);
      }
      match = scriptPattern.exec(html);
    }
  } catch (error) {
    console.warn('Failed to hash inline scripts for CSP:', error?.message || error);
  }

  const csp = [`script-src 'self' blob: ${hashes.join(' ')}`.trim(), ...APP_CSP_DIRECTIVES].join(
    '; ',
  );
  documentCspCache.set(filePath, { mtimeMs, csp });
  return csp;
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
      devTools: isDev,
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

  mainWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      // -3 (ERR_ABORTED) is emitted for navigations we cancel ourselves.
      if (!isMainFrame || errorCode === -3) return;
      console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
      dialog.showErrorBox(
        'Astrofox failed to start',
        `The application window could not be loaded.

${errorDescription} (${errorCode})
${validatedURL}`,
      );
    },
  );

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer process gone:', details.reason, details.exitCode);
    if (details.reason === 'clean-exit' || details.reason === 'killed') return;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
    dialog.showErrorBox(
      'Astrofox stopped responding',
      `The renderer process exited unexpectedly (${details.reason}, code ${details.exitCode}).`,
    );
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

  const loading = isDev
    ? mainWindow.loadURL(DEV_SERVER_URL)
    : mainWindow.loadURL('astrofox://app/');
  loading.catch(error => {
    // did-fail-load shows the user-facing message; just make sure the window
    // is visible so the app doesn't sit invisibly in the background.
    console.error('loadURL failed:', error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  });
}

function focusMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

function setupApplicationMenu() {
  if (isDev) {
    // Keep Electron's default menu in development (reload, devtools, etc.).
    return;
  }
  if (process.platform === 'darwin') {
    // macOS needs an application menu for the standard edit shortcuts to work.
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
        {
          role: 'editMenu',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectAll' },
          ],
        },
        { role: 'windowMenu' },
      ]),
    );
    return;
  }
  Menu.setApplicationMenu(null);
}

/**
 * Empty the Astrofox temp dir (leftover export frames/audio from a previous
 * crash) and make sure it exists. Best-effort and asynchronous so a slow or
 * locked file never blocks startup.
 */
async function resetTempDir() {
  const tempPath = getTempPath();
  try {
    const entries = await fs.promises.readdir(tempPath).catch(() => []);
    await Promise.all(
      entries.map(entry =>
        fs.promises
          .rm(path.join(tempPath, entry), { recursive: true, force: true, maxRetries: 2 })
          .catch(() => {}),
      ),
    );
  } catch {
    // non-fatal
  }
  try {
    await fs.promises.mkdir(tempPath, { recursive: true });
  } catch {
    // non-fatal
  }
}

// ---------------------------------------------------------------------------
// Auto update (packaged builds only)
// ---------------------------------------------------------------------------

/** @type {import('electron-updater').AppUpdater | null} */
let autoUpdater = null;
let updaterInitialized = false;
let updaterStatus = null;

// Dev-only simulated updater for testing the update flow end-to-end without a
// packaged build or release feed. Set ASTROFOX_FAKE_UPDATE to one of:
//   available (or 1/true) - check finds an update, download succeeds
//   none                  - check finds no update
//   error                 - check fails
function getFakeUpdateScenario() {
  if (app.isPackaged) return null;
  const value = String(process.env.ASTROFOX_FAKE_UPDATE || '').toLowerCase();
  if (!value) return null;
  if (value === 'none' || value === 'error') return value;
  return 'available';
}

const fakeUpdateScenario = getFakeUpdateScenario();

function sendUpdaterStatus(status) {
  updaterStatus = status;
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('updater:status', status);
}

/**
 * Mimics the subset of electron-updater's AppUpdater API used by the updater
 * IPC handlers, driving the same 'updater:status' events on a timer.
 */
function createFakeUpdater(scenario) {
  const fakeVersion = `${app.getVersion()}-fake.1`;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  console.warn(`Fake updater enabled (ASTROFOX_FAKE_UPDATE=${scenario})`);

  return {
    async checkForUpdates() {
      sendUpdaterStatus({ state: 'checking' });
      await delay(1200);

      if (scenario === 'none') {
        sendUpdaterStatus({ state: 'not-available', version: app.getVersion() });
        return { updateInfo: { version: app.getVersion() } };
      }

      if (scenario === 'error') {
        const message = 'Simulated update error (ASTROFOX_FAKE_UPDATE=error)';
        sendUpdaterStatus({ state: 'error', message });
        throw new Error(message);
      }

      sendUpdaterStatus({
        state: 'available',
        version: fakeVersion,
        releaseDate: new Date().toISOString(),
      });
      return { updateInfo: { version: fakeVersion } };
    },

    async downloadUpdate() {
      const total = 50 * 1024 * 1024;
      for (let percent = 0; percent <= 100; percent += 5) {
        sendUpdaterStatus({
          state: 'downloading',
          percent,
          transferred: Math.round((total * percent) / 100),
          total,
          bytesPerSecond: 8 * 1024 * 1024,
        });
        await delay(150);
      }
      sendUpdaterStatus({ state: 'downloaded', version: fakeVersion });
    },

    quitAndInstall() {
      console.warn('Fake updater: quitAndInstall called - relaunching app');
      app.relaunch();
      app.quit();
    },
  };
}

async function setupAutoUpdater() {
  if (updaterInitialized) return;
  updaterInitialized = true;

  if (!app.isPackaged) {
    if (fakeUpdateScenario) {
      autoUpdater = createFakeUpdater(fakeUpdateScenario);
    }
    return;
  }

  // electron-builder only writes app-update.yml for publishable targets
  // (nsis/dmg/zip/AppImage); an unpacked --dir build has none.
  if (!fs.existsSync(path.join(process.resourcesPath, 'app-update.yml'))) {
    console.warn('Auto update disabled: app-update.yml not found');
    return;
  }

  try {
    // Dynamic import so a missing dependency only disables updates instead of
    // preventing startup.
    const mod = await import('electron-updater');
    autoUpdater = mod.autoUpdater ?? mod.default?.autoUpdater ?? null;
  } catch (error) {
    console.warn('electron-updater unavailable:', error?.message || error);
    autoUpdater = null;
    return;
  }

  if (!autoUpdater) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = console;

  autoUpdater.on('checking-for-update', () => {
    sendUpdaterStatus({ state: 'checking' });
  });
  autoUpdater.on('update-available', info => {
    sendUpdaterStatus({
      state: 'available',
      version: info?.version,
      releaseDate: info?.releaseDate,
    });
  });
  autoUpdater.on('update-not-available', info => {
    sendUpdaterStatus({ state: 'not-available', version: info?.version });
  });
  autoUpdater.on('download-progress', progress => {
    sendUpdaterStatus({
      state: 'downloading',
      percent: progress?.percent ?? 0,
      transferred: progress?.transferred ?? 0,
      total: progress?.total ?? 0,
      bytesPerSecond: progress?.bytesPerSecond ?? 0,
    });
  });
  autoUpdater.on('update-downloaded', info => {
    sendUpdaterStatus({ state: 'downloaded', version: info?.version });
  });
  autoUpdater.on('error', error => {
    console.error('Auto update error:', error);
    sendUpdaterStatus({ state: 'error', message: error?.message || String(error) });
  });
}

function registerUpdaterIpc() {
  ipcMain.handle('updater:get-status', () => updaterStatus);

  ipcMain.handle('updater:check', async () => {
    if (!autoUpdater) {
      return { ok: false, reason: 'unavailable' };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      return { ok: true, version: result?.updateInfo?.version };
    } catch (error) {
      // The 'error' event already forwarded the status; surface to caller too.
      return { ok: false, reason: error?.message || String(error) };
    }
  });

  ipcMain.handle('updater:download', async () => {
    if (!autoUpdater) {
      return { ok: false, reason: 'unavailable' };
    }
    try {
      await autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error?.message || String(error) };
    }
  });

  ipcMain.handle('updater:install', async () => {
    if (!autoUpdater) {
      return { ok: false, reason: 'unavailable' };
    }
    // Let the renderer finish the IPC round-trip before the app tears down.
    setImmediate(() => {
      try {
        autoUpdater?.quitAndInstall(false, true);
      } catch (error) {
        console.error('quitAndInstall failed:', error);
      }
    });
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Process-level error handling
// ---------------------------------------------------------------------------

function reportFatal(kind, error) {
  console.error(`${kind}:`, error);
  if (isDev) return;
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  try {
    dialog.showErrorBox(`Astrofox: ${kind}`, message);
  } catch {
    // dialog may not be usable before app is ready; nothing more to do.
  }
}

process.on('uncaughtException', error => {
  reportFatal('Uncaught exception', error);
});

process.on('unhandledRejection', reason => {
  // Rejections are usually recoverable (a failed IPC handler, a network
  // error, an update check while offline); log them but don't interrupt the
  // user with a dialog.
  console.error('Unhandled rejection:', reason);
});

app.commandLine.appendSwitch('ignore-gpu-blocklist');

app.on('second-instance', () => {
  focusMainWindow();
});

app.on('before-quit', () => {
  killAllFfmpeg();
});

app.on('will-quit', () => {
  closeDatabase();
});

if (hasSingleInstanceLock) {
  app
    .whenReady()
    .then(async () => {
      void resetTempDir();

      // Must be open before the renderer's preload requests its storage snapshot.
      await openDatabase(path.join(app.getPath('userData'), 'astrofox.db'));

      setupApplicationMenu();
      registerIpc();
      registerUpdaterIpc();
      hardenSession();
      registerMediaProtocol();

      if (!isDev) {
        registerAppProtocol();
      }

      createWindow();

      // The renderer starts the automatic update check based on the user's
      // "Automatically check for updates" setting.
      await setupAutoUpdater();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        }
      });
    })
    .catch(error => {
      reportFatal('Startup failed', error);
      app.quit();
    });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

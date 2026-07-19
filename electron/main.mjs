import {
	app,
	BrowserWindow,
	ipcMain,
	protocol,
	net,
	shell,
} from "electron";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerDialogIpc } from "./dialogs-ipc.mjs";
import { registerFfmpegIpc } from "./ffmpeg-ipc.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev =
	process.env.ELECTRON_DEV === "1" ||
	process.env.NODE_ENV === "development" ||
	!app.isPackaged;

const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;
const WINDOW_MIN_WIDTH = 800;
const WINDOW_MIN_HEIGHT = 600;
const WINDOW_BGCOLOR = "#171717";
const DEV_SERVER_URL =
	process.env.ELECTRON_START_URL ||
	`http://localhost:${process.env.PORT || 3000}`;

/** @type {BrowserWindow | null} */
let mainWindow = null;

// Must be registered before app is ready.
protocol.registerSchemesAsPrivileged([
	{
		scheme: "astrofox",
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
			corsEnabled: true,
			stream: true,
			allowServiceWorkers: true,
		},
	},
]);

function getRendererRoot() {
	// electron/ is next to out/ in both dev and the packaged asar layout.
	return path.join(__dirname, "..", "out");
}

function getFfmpegBinaryPath() {
	const binaryName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
	if (app.isPackaged) {
		return path.join(process.resourcesPath, "bin", binaryName);
	}
	return path.join(__dirname, "..", "bin", binaryName);
}

function getTempPath() {
	return path.join(app.getPath("temp"), "Astrofox");
}

function getDesktopEnvironment() {
	return {
		APP_NAME: "Astrofox",
		APP_VERSION: app.getVersion(),
		IS_DESKTOP: true,
		IS_PACKAGED: app.isPackaged,
		OS_PLATFORM: process.platform,
		USER_DATA_PATH: app.getPath("userData"),
		TEMP_PATH: getTempPath(),
		FFMPEG_PATH: getFfmpegBinaryPath(),
		FFMPEG_AVAILABLE: fs.existsSync(getFfmpegBinaryPath()),
		ELECTRON_VERSION: process.versions.electron,
		CHROME_VERSION: process.versions.chrome,
		USER_AGENT: [
			`Astrofox/${app.getVersion()} (${process.platform})`,
			`Chrome/${process.versions.chrome}`,
			`Electron/${process.versions.electron}`,
		].join(" "),
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
	mainWindow.webContents.send("window-state-changed", getWindowState());
}

function registerIpc() {
	ipcMain.handle("window:minimize", () => {
		mainWindow?.minimize();
	});

	ipcMain.handle("window:maximize", () => {
		if (!mainWindow) return getWindowState();
		if (mainWindow.isMaximized()) {
			mainWindow.unmaximize();
		} else {
			mainWindow.maximize();
		}
		return getWindowState();
	});

	ipcMain.handle("window:close", () => {
		mainWindow?.close();
	});

	ipcMain.handle("window:get-state", () => getWindowState());

	ipcMain.handle("desktop:get-environment", () => getDesktopEnvironment());

	ipcMain.handle("desktop:open-path", async (_event, targetPath) => {
		if (typeof targetPath !== "string" || !targetPath) {
			throw new Error("Invalid path");
		}
		return shell.openPath(targetPath);
	});

	ipcMain.handle("desktop:show-item-in-folder", (_event, targetPath) => {
		if (typeof targetPath !== "string" || !targetPath) {
			throw new Error("Invalid path");
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

	protocol.handle("astrofox", (request) => {
		const url = new URL(request.url);
		let pathname = decodeURIComponent(url.pathname);

		if (!pathname || pathname === "/") {
			pathname = "/index.html";
		}

		// Prevent path traversal.
		const relative = pathname.replace(/^\/+/, "");
		const filePath = path.normalize(path.join(rendererRoot, relative));
		if (!filePath.startsWith(path.normalize(rendererRoot))) {
			return new Response("Forbidden", { status: 403 });
		}

		let resolved = filePath;
		if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
			resolved = path.join(resolved, "index.html");
		}

		if (!fs.existsSync(resolved)) {
			// SPA-style fallback for client routes.
			const fallback = path.join(rendererRoot, "index.html");
			if (fs.existsSync(fallback)) {
				return net.fetch(pathToFileURL(fallback).href);
			}
			return new Response("Not Found", { status: 404 });
		}

		return net.fetch(pathToFileURL(resolved).href);
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
		titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
		trafficLightPosition:
			process.platform === "darwin" ? { x: 12, y: 12 } : undefined,
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false,
			backgroundThrottling: false,
			webgl: true,
			devTools: true,
		},
	});

	mainWindow.once("ready-to-show", () => {
		mainWindow?.show();
		if (isDev) {
			mainWindow?.webContents.openDevTools({ mode: "detach" });
		}
	});

	mainWindow.on("focus", sendWindowState);
	mainWindow.on("blur", sendWindowState);
	mainWindow.on("maximize", sendWindowState);
	mainWindow.on("unmaximize", sendWindowState);
	mainWindow.on("minimize", sendWindowState);
	mainWindow.on("restore", sendWindowState);

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	if (isDev) {
		mainWindow.loadURL(DEV_SERVER_URL);
	} else {
		mainWindow.loadURL("astrofox://app/");
	}
}

app.commandLine.appendSwitch("ignore-gpu-blocklist");

app.whenReady().then(async () => {
	try {
		fs.mkdirSync(getTempPath(), { recursive: true });
	} catch {
		// non-fatal
	}

	registerIpc();

	if (!isDev) {
		registerAppProtocol();
	}

	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

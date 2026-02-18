import EventEmitter from "core/EventEmitter";
import jsmediatags from "jsmediatags/dist/jsmediatags.min.js";
import env from "view/env";

const events = new EventEmitter();
const CONFIG_KEY = "astrofox.config";

function buildPickerTypes(filters = []) {
	if (!filters.length) return undefined;

	return filters.map((filter) => ({
		description: filter.name || "Files",
		accept: {
			"application/octet-stream": (filter.extensions || []).map(
				(ext) => `.${ext}`,
			),
		},
	}));
}

async function toFile(input) {
	if (!input) return null;
	if (input instanceof File) return input;
	if (input.getFile) return input.getFile();
	return null;
}

async function saveBlob(target, blob, fallbackName) {
	if (target?.createWritable) {
		const writable = await target.createWritable();
		await writable.write(blob);
		await writable.close();
		return;
	}

	const filename =
		typeof target === "string" ? target : fallbackName || "astrofox";
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

async function request(path, options = {}) {
	const { method = "GET", body, headers = {} } = options;
	const response = await fetch(path, {
		method,
		credentials: "include",
		headers: {
			...(body ? { "Content-Type": "application/json" } : {}),
			...headers,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const raw = await response.text();
	let data = null;

	if (raw) {
		try {
			data = JSON.parse(raw);
		} catch {
			data = { message: raw };
		}
	}

	if (!response.ok) {
		const error = new Error(
			data?.message || `Request failed with status ${response.status}.`,
		);
		error.status = response.status;
		error.payload = data;
		throw error;
	}

	return data;
}

export function getEnvironment() {
	return env;
}

export function on(channel, callback) {
	events.on(channel, callback);
}

export function once(channel, callback) {
	events.once(channel, callback);
}

export function off(channel, callback) {
	events.off(channel, callback);
}

export function send(channel, data) {
	events.emit(channel, data);
}

export async function invoke() {
	throw new Error("IPC invoke is not available in web mode.");
}

export function log(...args) {
	// eslint-disable-next-line no-console
	console.log(...args);
}

export async function showOpenDialog(props = {}) {
	const types = buildPickerTypes(props.filters || []);
	const multiple = Boolean(props.multiple);

	if (window.showOpenFilePicker) {
		try {
			const handles = await window.showOpenFilePicker({ types, multiple });
			const files = await Promise.all(
				handles.map((handle) => handle.getFile()),
			);
			return { canceled: false, files, fileHandles: handles };
		} catch (error) {
			if (error && error.name === "AbortError") {
				return { canceled: true, files: [] };
			}
			throw error;
		}
	}

	return new Promise((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = multiple;
		if (props.filters?.length) {
			const extensions = props.filters.flatMap(
				(filter) => filter.extensions || [],
			);
			input.accept = extensions.map((ext) => `.${ext}`).join(",");
		}
		input.onchange = () => {
			const files = Array.from(input.files || []);
			resolve({ canceled: files.length === 0, files });
		};
		input.click();
	});
}

export async function showSaveDialog(props = {}) {
	const types = buildPickerTypes(props.filters || []);
	const suggestedName = props.defaultPath || "astrofox";

	if (window.showSaveFilePicker) {
		try {
			const handle = await window.showSaveFilePicker({ suggestedName, types });
			return { canceled: false, fileHandle: handle, filePath: handle.name };
		} catch (error) {
			if (error && error.name === "AbortError") {
				return { canceled: true };
			}
			throw error;
		}
	}

	return { canceled: false, filePath: suggestedName };
}

export async function readAudioFile(file) {
	const audioFile = await toFile(file);

	if (!audioFile) {
		throw new Error("No audio file provided.");
	}

	let { type } = audioFile;

	if (audioFile.name?.endsWith(".opus")) {
		type = "audio/opus";
	}

	if (!/^audio/.test(type)) {
		throw new Error(`Unrecognized audio type: ${type || "unknown"}`);
	}

	return audioFile.arrayBuffer();
}

export async function loadAudioTags(file) {
	try {
		const audioFile = await toFile(file);
		if (!audioFile) return null;
		return await new Promise((resolve) => {
			jsmediatags.read(audioFile, {
				onSuccess: (result) => resolve(result.tags || null),
				onError: (error) => {
					log(error);
					resolve(null);
				},
			});
		});
	} catch (error) {
		log(error);
		return null;
	}
}

export async function readImageFile(file) {
	const imageFile = await toFile(file);

	if (!imageFile) {
		throw new Error("No image file provided.");
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Failed to read image file."));
		reader.onload = () => resolve(reader.result);
		reader.readAsDataURL(imageFile);
	});
}

export async function readVideoFile(file) {
	const videoFile = await toFile(file);

	if (!videoFile) {
		throw new Error("No video file provided.");
	}

	if (videoFile.type && !/^video/.test(videoFile.type)) {
		throw new Error(`Unrecognized video type: ${videoFile.type}`);
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Failed to read video file."));
		reader.onload = () => resolve(reader.result);
		reader.readAsDataURL(videoFile);
	});
}

export async function saveImageFile(target, data, props = {}) {
	const mimeType = props.mimeType || "image/png";
	const blob = new Blob([data], { type: mimeType });
	const filename = props.fileName || "image.png";

	await saveBlob(target, blob, filename);
}

export async function loadConfig() {
	const value = localStorage.getItem(CONFIG_KEY);

	if (!value) {
		return null;
	}

	try {
		return JSON.parse(value);
	} catch (error) {
		log("Invalid config data found in localStorage. Resetting config.", error);
		localStorage.removeItem(CONFIG_KEY);
		return null;
	}
}

export async function saveConfig(config) {
	localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export async function getSession() {
	return request("/api/auth/get-session");
}

export async function signUpEmail(name, email, password) {
	return request("/api/auth/sign-up/email", {
		method: "POST",
		body: {
			name,
			email,
			password,
		},
	});
}

export async function signInEmail(email, password) {
	return request("/api/auth/sign-in/email", {
		method: "POST",
		body: {
			email,
			password,
		},
	});
}

export async function signOutUser() {
	return request("/api/auth/sign-out", {
		method: "POST",
	});
}

export function signInWithGoogle(callbackURL = window.location.href) {
	const params = new URLSearchParams({
		provider: "google",
		callbackURL,
	});

	window.location.assign(`/api/auth/sign-in/social?${params.toString()}`);
}

export async function listProjects() {
	return request("/api/projects");
}

export async function createProject(name) {
	return request("/api/projects", {
		method: "POST",
		body: { name },
	});
}

export async function getProjectById(projectId) {
	return request(`/api/projects/${projectId}`);
}

export async function renameProject(projectId, name) {
	return request(`/api/projects/${projectId}`, {
		method: "PATCH",
		body: { name },
	});
}

export async function deleteProjectById(projectId) {
	return request(`/api/projects/${projectId}`, {
		method: "DELETE",
	});
}

export async function createProjectRevision(
	projectId,
	snapshot,
	mediaRefs = [],
) {
	return request(`/api/projects/${projectId}/revisions`, {
		method: "POST",
		body: { snapshot, mediaRefs },
	});
}

export async function duplicateProjectById(projectId, name) {
	return request(`/api/projects/${projectId}/duplicate`, {
		method: "POST",
		body: { name },
	});
}

export async function loadPlugins() {
	return {};
}

export function getPlugins() {
	return {};
}

export function spawnProcess() {
	throw new Error("Process spawning is not available in web mode.");
}

export function maximizeWindow() {}
export function unmaximizeWindow() {}
export function minimizeWindow() {}

export function closeWindow() {
	window.close();
}

export function openDevTools() {}

export async function getWindowState() {
	return {
		focused: document.hasFocus(),
		maximized: false,
		minimized: false,
	};
}

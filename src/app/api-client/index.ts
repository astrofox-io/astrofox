import EventEmitter from "@/lib/core/EventEmitter";
import type { EventCallback } from "@/lib/types";
import env from "@/app/env";
import jsmediatags from "jsmediatags/dist/jsmediatags.min.js";

const events = new EventEmitter();

interface FileFilter {
	name?: string;
	mimeType?: string;
	extensions?: string[];
}

interface PickerType {
	description: string;
	accept: Record<string, string[]>;
}

interface RequestOptions {
	method?: string;
	body?: Record<string, unknown>;
	headers?: Record<string, string>;
}

interface OpenDialogProps {
	filters?: FileFilter[];
	multiple?: boolean;
}

interface SaveDialogProps {
	filters?: FileFilter[];
	defaultPath?: string;
}

interface SaveFileProps {
	mimeType?: string;
	fileName?: string;
}

interface FileHandle {
	getFile: () => Promise<File>;
	createWritable: () => Promise<{
		write: (blob: Blob) => Promise<void>;
		close: () => Promise<void>;
	}>;
	name: string;
}

function buildPickerTypes(
	filters: FileFilter[] = [],
): PickerType[] | undefined {
	if (!filters.length) return undefined;

	return filters.map((filter) => ({
		description: filter.name || "Files",
		accept: {
			[filter.mimeType || "application/octet-stream"]: (
				filter.extensions || []
			).map((ext: string) => `.${ext}`),
		},
	}));
}

async function toFile(input: File | FileHandle | null): Promise<File | null> {
	if (!input) return null;
	if (input instanceof File) return input;
	if ("getFile" in input && input.getFile) return input.getFile();
	return null;
}

async function saveBlob(
	target: FileHandle | string | null,
	blob: Blob,
	fallbackName: string,
) {
	if (
		target &&
		typeof target === "object" &&
		"createWritable" in target &&
		target.createWritable
	) {
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

interface RequestError extends Error {
	status?: number;
	payload?: unknown;
}

async function request(path: string, options: RequestOptions = {}) {
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
	let data: Record<string, unknown> | null = null;

	if (raw) {
		try {
			data = JSON.parse(raw);
		} catch {
			data = { message: raw };
		}
	}

	if (!response.ok) {
		const error: RequestError = new Error(
			(data?.message as string) ||
				`Request failed with status ${response.status}.`,
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

export function on(channel: string, callback: EventCallback) {
	events.on(channel, callback);
}

export function once(channel: string, callback: EventCallback) {
	events.once(channel, callback);
}

export function off(channel: string, callback: EventCallback) {
	events.off(channel, callback);
}

export function send(channel: string, data?: unknown) {
	events.emit(channel, data);
}

export async function invoke() {
	throw new Error("IPC invoke is not available in web mode.");
}

export function log(...args: unknown[]) {
	// eslint-disable-next-line no-console
	console.log(...args);
}

export async function showOpenDialog(props: OpenDialogProps = {}) {
	const types = buildPickerTypes(props.filters || []);
	const multiple = Boolean(props.multiple);

	if (window.showOpenFilePicker) {
		try {
			const handles = await window.showOpenFilePicker({ types, multiple });
			const files = await Promise.all(
				handles.map((handle: FileHandle) => handle.getFile()),
			);
			return { canceled: false, files, fileHandles: handles };
		} catch (error) {
			if (error && (error as Error).name === "AbortError") {
				return { canceled: true, files: [] as File[] };
			}
			throw error;
		}
	}

	return new Promise<{ canceled: boolean; files: File[] }>((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = multiple;
		if (props.filters?.length) {
			const extensions = props.filters.flatMap(
				(filter: FileFilter) => filter.extensions || [],
			);
			input.accept = extensions.map((ext: string) => `.${ext}`).join(",");
		}
		input.onchange = () => {
			const files = Array.from(input.files || []);
			resolve({ canceled: files.length === 0, files });
		};
		input.click();
	});
}

export async function showSaveDialog(props: SaveDialogProps = {}) {
	const types = buildPickerTypes(props.filters || []);
	const suggestedName = props.defaultPath || "astrofox";

	if (window.showSaveFilePicker) {
		try {
			const handle = await window.showSaveFilePicker({ suggestedName, types });
			return { canceled: false, fileHandle: handle, filePath: handle.name };
		} catch (error) {
			if (error && (error as Error).name === "AbortError") {
				return { canceled: true };
			}
			throw error;
		}
	}

	return { canceled: false, filePath: suggestedName };
}

export async function readAudioFile(file: File | FileHandle) {
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

export async function loadAudioTags(file: File | FileHandle) {
	try {
		const audioFile = await toFile(file);
		if (!audioFile) return null;
		return await new Promise<Record<string, unknown> | null>((resolve) => {
			jsmediatags.read(audioFile, {
				onSuccess: (result: { tags: Record<string, unknown> | null }) =>
					resolve(result.tags || null),
				onError: (error: unknown) => {
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

export async function readImageFile(file: File | FileHandle) {
	const imageFile = await toFile(file);

	if (!imageFile) {
		throw new Error("No image file provided.");
	}

	return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Failed to read image file."));
		reader.onload = () => resolve(reader.result);
		reader.readAsDataURL(imageFile);
	});
}

export async function readVideoFile(file: File | FileHandle) {
	const videoFile = await toFile(file);

	if (!videoFile) {
		throw new Error("No video file provided.");
	}

	if (videoFile.type && !/^video/.test(videoFile.type)) {
		throw new Error(`Unrecognized video type: ${videoFile.type}`);
	}

	return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Failed to read video file."));
		reader.onload = () => resolve(reader.result);
		reader.readAsDataURL(videoFile);
	});
}

export async function saveImageFile(
	target: FileHandle | string | null,
	data: BlobPart,
	props: SaveFileProps = {},
) {
	const mimeType = props.mimeType || "image/png";
	const blob = new Blob([data], { type: mimeType });
	const filename = props.fileName || "image.png";

	await saveBlob(target, blob, filename);
}

export async function saveVideoFile(
	target: FileHandle | string | null,
	data: BlobPart,
	props: SaveFileProps = {},
) {
	const mimeType = props.mimeType || "video/webm";
	const blob = new Blob([data], { type: mimeType });
	const filename = props.fileName || "video.webm";

	await saveBlob(target, blob, filename);
}

export async function saveTextFile(
	target: FileHandle | string | null,
	data: BlobPart,
	props: SaveFileProps = {},
) {
	const mimeType = props.mimeType || "application/octet-stream";
	const blob = new Blob([data], { type: mimeType });
	const filename = props.fileName || "download.txt";

	await saveBlob(target, blob, filename);
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

export function openDevTools() {}

export async function getWindowState() {
	return {
		focused: document.hasFocus(),
		maximized: false,
		minimized: false,
	};
}

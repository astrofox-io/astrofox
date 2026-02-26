// @ts-nocheck
import AudioReactor from "@/lib/audio/AudioReactor";
import Display from "@/lib/core/Display";
import Entity from "@/lib/core/Entity";
import Scene from "@/lib/core/Scene";
import Stage from "@/lib/core/Stage";
import { resetLabelCount } from "@/lib/utils/controls";
import { raiseError } from "@/lib/view/actions/error";
import { showModal } from "@/lib/view/actions/modals";
import { loadReactors, resetReactors } from "@/lib/view/actions/reactors";
import {
	loadScenes,
	resetScenes,
	updateElementProperty,
} from "@/lib/view/actions/scenes";
import { updateCanvas, updateStage } from "@/lib/view/actions/stage";
import {
	BLANK_IMAGE,
	DEFAULT_CANVAS_BGCOLOR,
	DEFAULT_CANVAS_HEIGHT,
	DEFAULT_CANVAS_WIDTH,
} from "@/lib/view/constants";
import { api, env, library, logger, reactors, stage } from "@/lib/view/global";
import create from "zustand";

export const DEFAULT_PROJECT_NAME = "Untitled Project";

const PROJECT_FILE_FILTERS = [
	{
		name: "Astrofox project",
		extensions: ["json"],
		mimeType: "application/json",
	},
];

const initialState = {
	projectId: null,
	projectName: DEFAULT_PROJECT_NAME,
	opened: 0,
	lastModified: 0,
	unresolvedMediaRefs: [],
};

const projectStore = create(() => ({
	...initialState,
}));

function snapshotProject() {
	return {
		version: env.APP_VERSION,
		stage: stage.toJSON(),
		scenes: stage.scenes.toJSON(),
		reactors: reactors.toJSON(),
	};
}

function isEmbeddedMediaSource(src) {
	return /^data:(image|video)\//i.test(src);
}

function isRemoteMediaSource(src) {
	return /^(https?:)?\/\//i.test(src);
}

function isBlobMediaSource(src) {
	return /^blob:/i.test(src);
}

function isFileUrlSource(src) {
	return /^file:\/\//i.test(src);
}

function isWindowsPathSource(src) {
	return /^[a-zA-Z]:[\\/]/.test(src);
}

function isUncPathSource(src) {
	return /^\\\\/.test(src);
}

function normalizeMediaPath(path) {
	if (typeof path !== "string") {
		return "";
	}

	return path.trim();
}

function fileUrlToPath(src) {
	if (!isFileUrlSource(src)) {
		return "";
	}

	try {
		const url = new URL(src);
		let path = decodeURIComponent(url.pathname || "");

		if (/^\/[a-zA-Z]:/.test(path)) {
			path = path.slice(1);
		}

		if (url.host) {
			return `\\\\${url.host}${path.replace(/\//g, "\\")}`;
		}

		if (/^[a-zA-Z]:/.test(path)) {
			return path.replace(/\//g, "\\");
		}

		return path;
	} catch {
		const rawPath = decodeURIComponent(src.replace(/^file:\/\//i, ""));
		return rawPath.replace(/^\/[a-zA-Z]:/, (match) => match.slice(1));
	}
}

function toFileUrl(path) {
	const sourcePath = normalizeMediaPath(path);

	if (!sourcePath) {
		return "";
	}

	if (isFileUrlSource(sourcePath)) {
		return sourcePath;
	}

	const escaped = encodeURI(sourcePath)
		.replace(/#/g, "%23")
		.replace(/\?/g, "%3F");

	if (isWindowsPathSource(sourcePath)) {
		return `file:///${escaped.replace(/\\/g, "/")}`;
	}

	if (isUncPathSource(sourcePath)) {
		const unc = escaped.replace(/^\\\\/, "").replace(/\\/g, "/");
		return `file://${unc}`;
	}

	if (sourcePath.startsWith("/")) {
		return `file://${escaped}`;
	}

	return sourcePath;
}

function getMediaSourcePath(src) {
	if (typeof src !== "string") {
		return "";
	}

	if (isFileUrlSource(src)) {
		return normalizeMediaPath(fileUrlToPath(src));
	}

	if (isWindowsPathSource(src) || isUncPathSource(src)) {
		return normalizeMediaPath(src);
	}

	return "";
}

function getFilePath(file) {
	if (!file || typeof file !== "object") {
		return "";
	}

	const path =
		normalizeMediaPath(file.path) ||
		normalizeMediaPath(file.filePath) ||
		normalizeMediaPath(file.fullPath);

	return path;
}

function getMediaKind(element) {
	return element?.name === "VideoDisplay" ? "video" : "image";
}

function getMediaLabel(element) {
	return element?.displayName || element?.name || "Media";
}

function buildMediaRef(element, sourcePath = "") {
	return {
		displayId: element.id,
		kind: getMediaKind(element),
		label: getMediaLabel(element),
		sourcePath,
	};
}

function normalizeMediaRef(mediaRef) {
	if (!mediaRef || typeof mediaRef !== "object" || !mediaRef.displayId) {
		return null;
	}

	return {
		displayId: mediaRef.displayId,
		kind: mediaRef.kind === "video" ? "video" : "image",
		label: mediaRef.label || "Media",
		sourcePath:
			normalizeMediaPath(mediaRef.sourcePath) ||
			normalizeMediaPath(mediaRef.path) ||
			"",
	};
}

function mergeMediaRefs(...groups) {
	const byDisplayId = new Map();

	for (const group of groups) {
		for (const mediaRef of group || []) {
			const normalized = normalizeMediaRef(mediaRef);
			if (!normalized) {
				continue;
			}

			const previous = byDisplayId.get(normalized.displayId);

			byDisplayId.set(normalized.displayId, {
				...(previous || {}),
				...normalized,
				sourcePath: normalized.sourcePath || previous?.sourcePath || "",
			});
		}
	}

	return Array.from(byDisplayId.values());
}

async function canLoadMediaSource(src, kind) {
	if (!src) {
		return false;
	}

	return new Promise((resolve) => {
		let settled = false;

		function done(result) {
			if (settled) {
				return;
			}

			settled = true;
			resolve(result);
		}

		const timeoutId = window.setTimeout(() => done(false), 2000);

		if (kind === "video") {
			const video = document.createElement("video");
			video.preload = "metadata";

			video.onloadedmetadata = () => {
				window.clearTimeout(timeoutId);
				video.removeAttribute("src");
				video.load();
				done(true);
			};

			video.onerror = () => {
				window.clearTimeout(timeoutId);
				video.removeAttribute("src");
				video.load();
				done(false);
			};

			video.src = src;
			return;
		}

		const image = new Image();

		image.onload = () => {
			window.clearTimeout(timeoutId);
			done(true);
		};

		image.onerror = () => {
			window.clearTimeout(timeoutId);
			done(false);
		};

		image.src = src;
	});
}

function prepareSnapshotMediaForSave(snapshot) {
	const mediaRefs = [];

	const scenes = (snapshot?.scenes || []).map((scene) => {
		const mapMediaProps = (element) => {
			const src = element?.properties?.src;
			const sourcePath = normalizeMediaPath(element?.properties?.sourcePath);

			if (sourcePath) {
				mediaRefs.push(buildMediaRef(element, sourcePath));

				if (!src || src === BLANK_IMAGE || typeof src !== "string") {
					return {
						...element,
						properties: {
							...element.properties,
							sourcePath,
						},
					};
				}

				return {
					...element,
					properties: {
						...element.properties,
						src: toFileUrl(sourcePath),
						sourcePath,
					},
				};
			}

			if (!src || src === BLANK_IMAGE || typeof src !== "string") {
				return element;
			}

			const inferredSourcePath = getMediaSourcePath(src);

			if (inferredSourcePath) {
				mediaRefs.push(buildMediaRef(element, inferredSourcePath));

				return {
					...element,
					properties: {
						...element.properties,
						src: toFileUrl(inferredSourcePath),
						sourcePath: inferredSourcePath,
					},
				};
			}

			if (isBlobMediaSource(src)) {
				mediaRefs.push(buildMediaRef(element));

				return {
					...element,
					properties: {
						...element.properties,
						src: BLANK_IMAGE,
						sourcePath: "",
					},
				};
			}

			if (isEmbeddedMediaSource(src) || isRemoteMediaSource(src)) {
				return element;
			}

			return element;
		};

		return {
			...scene,
			displays: (scene.displays || []).map(mapMediaProps),
			effects: (scene.effects || []).map(mapMediaProps),
		};
	});

	return {
		snapshot: {
			...snapshot,
			scenes,
		},
		mediaRefs,
	};
}

async function resolveSnapshotMediaOnLoad(snapshot, payloadMediaRefs = []) {
	const mediaRefMap = new Map();

	for (const mediaRef of payloadMediaRefs || []) {
		const normalized = normalizeMediaRef(mediaRef);

		if (normalized) {
			mediaRefMap.set(normalized.displayId, normalized);
		}
	}

	const unresolvedMediaRefs = [];

	const scenes = await Promise.all(
		(snapshot?.scenes || []).map(async (scene) => {
			const mapMediaProps = async (element) => {
				const src = element?.properties?.src;

				const mediaRef = mediaRefMap.get(element.id);
				const sourcePath =
					normalizeMediaPath(element?.properties?.sourcePath) ||
					normalizeMediaPath(mediaRef?.sourcePath) ||
					getMediaSourcePath(src);

				if (sourcePath) {
					const sourceUrl = toFileUrl(sourcePath);
					const canLoad = await canLoadMediaSource(
						sourceUrl,
						getMediaKind(element),
					);

					if (canLoad) {
						return {
							...element,
							properties: {
								...element.properties,
								src: sourceUrl,
								sourcePath,
							},
						};
					}

					if (isEmbeddedMediaSource(src) || isRemoteMediaSource(src)) {
						return {
							...element,
							properties: {
								...element.properties,
								sourcePath: "",
							},
						};
					}

					unresolvedMediaRefs.push(buildMediaRef(element, sourcePath));

					return {
						...element,
						properties: {
							...element.properties,
							src: BLANK_IMAGE,
							sourcePath,
						},
					};
				}

				if (!src || src === BLANK_IMAGE || typeof src !== "string") {
					return element;
				}

				if (isBlobMediaSource(src)) {
					unresolvedMediaRefs.push(buildMediaRef(element));

					return {
						...element,
						properties: {
							...element.properties,
							src: BLANK_IMAGE,
							sourcePath: "",
						},
					};
				}

				return element;
			};

			return {
				...scene,
				displays: await Promise.all((scene.displays || []).map(mapMediaProps)),
				effects: await Promise.all((scene.effects || []).map(mapMediaProps)),
			};
		}),
	);

	return {
		snapshot: {
			...snapshot,
			scenes,
		},
		unresolvedMediaRefs,
	};
}

function setUnresolvedMediaRefs(mediaRefs = []) {
	projectStore.setState({
		unresolvedMediaRefs: mediaRefs,
	});
}

function sanitizeFileName(name) {
	return (name || "")
		.trim()
		.replace(/[<>:\"/\\|?*\x00-\x1F]/g, "-")
		.replace(/\s+/g, " ")
		.trim();
}

function createProjectFileName(name) {
	const safeName = sanitizeFileName(name) || DEFAULT_PROJECT_NAME;
	return `${safeName}.json`;
}

function parseProjectNameFromFile(fileName = "") {
	return fileName.replace(/\.json$/i, "").trim() || DEFAULT_PROJECT_NAME;
}

function parseProjectPayload(payload, fallbackName) {
	if (!payload || typeof payload !== "object") {
		throw new Error("Invalid project file.");
	}

	const snapshot =
		payload.snapshot ||
		payload.snapshotJson ||
		payload.project?.snapshot ||
		payload.project?.snapshotJson ||
		payload;

	if (!snapshot || typeof snapshot !== "object") {
		throw new Error("Invalid project snapshot.");
	}

	return {
		snapshot,
		projectName:
			payload.projectName ||
			payload.name ||
			payload.project?.name ||
			fallbackName ||
			DEFAULT_PROJECT_NAME,
		mediaRefs: payload.mediaRefs || payload.project?.mediaRefs || [],
	};
}

async function loadProjectFromPayload(payload, fallbackName) {
	const { snapshot, projectName, mediaRefs } = parseProjectPayload(
		payload,
		fallbackName,
	);
	const {
		snapshot: resolvedSnapshot,
		unresolvedMediaRefs: detectedMissingMedia,
	} = await resolveSnapshotMediaOnLoad(snapshot, mediaRefs);
	const unresolvedMediaRefs = mergeMediaRefs(detectedMissingMedia);

	loadProject(resolvedSnapshot);
	await loadScenes();

	projectStore.setState({
		projectId: null,
		projectName: projectName || DEFAULT_PROJECT_NAME,
		opened: Date.now(),
		lastModified: 0,
		unresolvedMediaRefs: unresolvedMediaRefs,
	});

	if (unresolvedMediaRefs.length > 0) {
		const count = unresolvedMediaRefs.length;
		openRelinkMediaDialog({
			title: `${count} media file${count === 1 ? "" : "s"} missing`,
		});
	}
}

export function touchProject() {
	projectStore.setState({ lastModified: Date.now() });
}

export function resetProject() {
	projectStore.setState({ ...initialState });
}

export function loadProject(data) {
	logger.log("Loaded project:", data);

	const displays = library.get("displays");
	const effects = library.get("effects");

	const loadElement = (scene, config) => {
		const { name } = config;
		const module = displays[name] || effects[name];

		if (module) {
			const entity = Display.create(module, config);
			scene.addElement(entity);
		} else {
			logger.warn("Component not found:", name);
		}
	};

	resetScenes(false);
	resetReactors();
	resetLabelCount();

	if (data.stage) {
		updateStage(data.stage.properties);
	} else {
		updateStage(Stage.defaultProperties);
	}

	if (data.reactors) {
		for (const config of data.reactors) {
			const reactor = Entity.create(AudioReactor, config);
			reactors.addReactor(reactor);
		}
	}

	if (data.scenes) {
		for (const config of data.scenes) {
			const scene = Display.create(Scene, config);

			stage.addScene(scene);

			if (config.displays) {
				for (const display of config.displays) {
					loadElement(scene, display);
				}
			}

			if (config.effects) {
				for (const effect of config.effects) {
					loadElement(scene, effect);
				}
			}
		}
	}
}

export async function newProject() {
	resetLabelCount();
	await resetScenes();
	await resetReactors();
	await updateCanvas(
		DEFAULT_CANVAS_WIDTH,
		DEFAULT_CANVAS_HEIGHT,
		DEFAULT_CANVAS_BGCOLOR,
	);

	const scene = stage.addScene();
	const displays = library.get("displays");

	scene.addElement(new displays.ImageDisplay());
	scene.addElement(new displays.BarSpectrumDisplay());
	scene.addElement(new displays.TextDisplay());

	await loadScenes();
	await loadReactors();

	projectStore.setState({
		projectId: null,
		projectName: DEFAULT_PROJECT_NAME,
		opened: Date.now(),
		lastModified: 0,
		unresolvedMediaRefs: [],
	});
}

export function checkUnsavedChanges(menuAction, action) {
	const { opened, lastModified } = projectStore.getState();

	if (lastModified > opened) {
		showModal(
			"UnsavedChangesDialog",
			{ showCloseButton: false },
			{ action: menuAction },
		);
	} else {
		action();
	}
}

export async function openProjectFile() {
	try {
		const { files, canceled } = await api.showOpenDialog({
			filters: PROJECT_FILE_FILTERS,
		});

		if (canceled || !files || !files.length) {
			return false;
		}

		const file = files[0];
		if (!/\.json$/i.test(file.name || "")) {
			throw new Error("Project file must use the .json extension.");
		}
		const text = await file.text();
		const payload = JSON.parse(text);
		const fallbackName = parseProjectNameFromFile(file.name);

		await loadProjectFromPayload(payload, fallbackName);
		return true;
	} catch (error) {
		raiseError("Failed to open project file.", error);
		return false;
	}
}

export function openProjectBrowser() {
	return openProjectFile();
}

export function openRelinkMediaDialog(modalProps = {}) {
	showModal("RelinkMediaDialog", {
		title: "Relink Media",
		...modalProps,
	});
}

export async function listProjects() {
	return [];
}

export async function loadProjectById(_projectId) {
	raiseError("Cloud projects were removed.", new Error("Use Open project."));
}

export async function renameProjectById(_projectId, _name) {
	raiseError(
		"Cloud projects were removed.",
		new Error("Use Save project to download a new file."),
	);
	return null;
}

export async function deleteProjectById(_projectId) {
	raiseError(
		"Cloud projects were removed.",
		new Error("Use your file system to delete local project files."),
	);
}

export async function saveProject(nameOverride) {
	const state = projectStore.getState();
	const name = (
		nameOverride ||
		state.projectName ||
		DEFAULT_PROJECT_NAME
	).trim();

	try {
		const { snapshot, mediaRefs } = prepareSnapshotMediaForSave(
			snapshotProject(),
		);
		const payload = {
			name,
			projectName: name,
			version: env.APP_VERSION,
			savedAt: new Date().toISOString(),
			snapshot,
			mediaRefs,
		};
		const fileName = createProjectFileName(name);
		const { fileHandle, filePath, canceled } = await api.showSaveDialog({
			defaultPath: fileName,
			filters: PROJECT_FILE_FILTERS,
		});

		if (canceled) {
			return false;
		}

		const target = fileHandle || filePath || fileName;
		await api.saveTextFile(target, JSON.stringify(payload, null, 2), {
			mimeType: "application/json",
			fileName,
		});

		projectStore.setState({
			projectId: null,
			projectName: name,
			opened: Date.now(),
			lastModified: 0,
			unresolvedMediaRefs: [],
		});

		logger.log("Project saved locally:", fileName);
		return true;
	} catch (error) {
		raiseError("Failed to save project file.", error);
		return false;
	}
}

export async function relinkMediaRef(mediaRef) {
	try {
		const isVideo = mediaRef.kind === "video";
		const filters = isVideo
			? [{ name: "Video files", extensions: ["mp4", "webm", "ogv"] }]
			: [{ name: "Image files", extensions: ["jpg", "jpeg", "png", "gif"] }];
		const { files, canceled } = await api.showOpenDialog({ filters });

		if (canceled || !files || !files.length) {
			return;
		}

		const file = files[0];
		const sourcePath = getFilePath(file);
		const src = sourcePath
			? toFileUrl(sourcePath)
			: isVideo
				? await api.readVideoFile(file)
				: await api.readImageFile(file);

		updateElementProperty(mediaRef.displayId, "src", src);
		updateElementProperty(mediaRef.displayId, "sourcePath", sourcePath || "");

		setUnresolvedMediaRefs(
			projectStore
				.getState()
				.unresolvedMediaRefs.filter(
					(ref) => ref.displayId !== mediaRef.displayId,
				),
		);
	} catch (error) {
		raiseError("Failed to relink media.", error);
	}
}

export function clearUnresolvedMedia() {
	setUnresolvedMediaRefs([]);
}

export default projectStore;

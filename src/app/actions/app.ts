// @ts-nocheck
import Plugin from "@/lib/core/Plugin";
import * as displays from "@/lib/displays";
import * as effects from "@/lib/effects";
import { openAudioFile } from "@/app/actions/audio";
import { raiseError } from "@/app/actions/error";
import { showModal } from "@/app/actions/modals";
import {
	checkUnsavedChanges,
	newProject,
	openProjectBrowser,
	saveProject,
} from "@/app/actions/project";
import {
	api,
	audioContext,
	library,
	logger,
	player,
	renderBackend,
	renderer,
} from "@/app/global";
import create from "zustand";

const initialState = {
	statusText: "",
	showReactor: false,
	activeReactorId: null,
	activeElementId: null,
};

const appStore = create(() => ({
	...initialState,
}));

let appInitPromise = null;
let appInitialized = false;
let activeVideoRecorder = null;

const DEFAULT_VIDEO_FPS = 60;
const DEFAULT_VIDEO_DURATION_SECONDS = 10;
const RECORDING_TIMESLICE_MS = 250;
const VIDEO_BITS_PER_SECOND = 8_000_000;
const VIDEO_MIME_CANDIDATES = [
	"video/webm;codecs=vp9,opus",
	"video/webm;codecs=vp8,opus",
	"video/webm",
	"video/mp4;codecs=avc1.42E01E,mp4a.40.2",
	"video/mp4",
];

function getSupportedVideoMimeType() {
	if (
		typeof window === "undefined" ||
		typeof window.MediaRecorder === "undefined"
	) {
		return null;
	}

	return (
		VIDEO_MIME_CANDIDATES.find((mimeType) =>
			window.MediaRecorder.isTypeSupported(mimeType),
		) || null
	);
}

function getExtensionFromMimeType(mimeType) {
	return mimeType.includes("mp4") ? "mp4" : "webm";
}

export async function saveImage() {
	const { fileHandle, filePath, canceled } = await api.showSaveDialog({
		defaultPath: `image-${Date.now()}.png`,
		filters: [
			{ name: "PNG", extensions: ["png"] },
			{ name: "JPEG", extensions: ["jpg"] },
		],
	});

	if (!canceled) {
		try {
			const data = renderer.getFrameData(false);

			renderBackend.render(data);

			const fileName =
				filePath || fileHandle?.name || `image-${Date.now()}.png`;
			const isJpeg = /jpe?g$/i.test(fileName);
			const mimeType = isJpeg ? "image/jpeg" : "image/png";
			const buffer = renderBackend.getImage(mimeType);

			await api.saveImageFile(fileHandle || fileName, buffer, {
				mimeType,
				fileName,
			});

			logger.log("Image saved:", fileName);
		} catch (error) {
			raiseError("Failed to save image file.", error);
		}
	}
}

export async function saveVideo() {
	if (activeVideoRecorder && activeVideoRecorder.state === "recording") {
		raiseError("A video recording is already in progress.");
		return;
	}

	if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
		raiseError("Video recording is not supported in this browser.");
		return;
	}

	const canvas = renderBackend.getCanvas?.();

	if (!canvas || typeof canvas.captureStream !== "function") {
		raiseError("Failed to access the stage canvas for video recording.");
		return;
	}

	const mimeType = getSupportedVideoMimeType();

	if (!mimeType) {
		raiseError("No supported video format found for recording.");
		return;
	}

	let durationMs = DEFAULT_VIDEO_DURATION_SECONDS * 1000;
	const hasAudio = player.hasAudio() && player.getDuration() > 0;

	if (hasAudio) {
		const totalDuration = player.getDuration();
		const remainingDuration = totalDuration - player.getCurrentTime();
		const nextDuration =
			remainingDuration > 0 ? remainingDuration : totalDuration;

		durationMs = Math.max(250, Math.round(nextDuration * 1000));
	} else {
		const response = window.prompt(
			"Video length in seconds",
			String(DEFAULT_VIDEO_DURATION_SECONDS),
		);

		if (response === null) {
			return;
		}

		const seconds = Number(response);

		if (!Number.isFinite(seconds) || seconds <= 0) {
			raiseError("Please enter a valid video length in seconds.");
			return;
		}

		durationMs = Math.round(seconds * 1000);
	}

	const extension = getExtensionFromMimeType(mimeType);
	const defaultPath = `video-${Date.now()}.${extension}`;
	const { fileHandle, filePath, canceled } = await api.showSaveDialog({
		defaultPath,
		filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
	});

	if (canceled) {
		return;
	}

	try {
		if (audioContext.state === "suspended") {
			await audioContext.resume();
		}

		const canvasStream = canvas.captureStream(DEFAULT_VIDEO_FPS);
		const tracks = [...canvasStream.getVideoTracks()];

		let audioDestination = null;
		if (hasAudio) {
			audioDestination = audioContext.createMediaStreamDestination();
			player.volume.connect(audioDestination);
			tracks.push(...audioDestination.stream.getAudioTracks());
		}

		const recordingStream = new MediaStream(tracks);
		const recorder = new window.MediaRecorder(recordingStream, {
			mimeType,
			videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
		});

		activeVideoRecorder = recorder;
		const chunks = [];
		const fileName = filePath || fileHandle?.name || defaultPath;
		let stopTimer = null;
		let recordingFailed = false;

		const onPlayerStop = () => {
			if (recorder.state === "recording") {
				recorder.stop();
			}
		};

		const cleanup = () => {
			if (stopTimer) {
				window.clearTimeout(stopTimer);
				stopTimer = null;
			}

			player.off("stop", onPlayerStop);

			if (audioDestination) {
				try {
					player.volume.disconnect(audioDestination);
				} catch (_error) {
					// Ignore disconnect errors from stale nodes.
				}
			}

			recordingStream.getTracks().forEach((track) => track.stop());
			activeVideoRecorder = null;
		};

		recorder.ondataavailable = (event) => {
			if (event.data && event.data.size > 0) {
				chunks.push(event.data);
			}
		};

		recorder.onerror = (event) => {
			recordingFailed = true;
			cleanup();
			raiseError("Failed to record video.", event?.error || event);
		};

		recorder.onstop = async () => {
			if (recordingFailed) {
				cleanup();
				return;
			}

			try {
				const blob = new Blob(chunks, { type: mimeType });

				await api.saveVideoFile(fileHandle || fileName, blob, {
					mimeType,
					fileName,
				});

				appStore.setState({ statusText: `Video saved: ${fileName}` });
				logger.log("Video saved:", fileName);
			} catch (error) {
				raiseError("Failed to save video file.", error);
			} finally {
				cleanup();
			}
		};

		if (hasAudio) {
			player.on("stop", onPlayerStop);

			if (!player.isPlaying()) {
				if (player.getPosition() >= 1) {
					player.seek(0);
				}

				player.play();
			}
		}

		recorder.start(RECORDING_TIMESLICE_MS);
		appStore.setState({
			statusText: hasAudio
				? "Recording video with audio..."
				: "Recording video...",
		});

		stopTimer = window.setTimeout(() => {
			if (recorder.state === "recording") {
				recorder.stop();
			}
		}, durationMs);
	} catch (error) {
		activeVideoRecorder = null;
		raiseError("Failed to start video recording.", error);
	}
}

export function setActiveReactorId(reactorId) {
	appStore.setState({ activeReactorId: reactorId || null });
}

export function setActiveElementId(elementId) {
	appStore.setState({ activeElementId: elementId || null });
}

export async function handleMenuAction(action) {
	switch (action) {
		case "new-project":
			await checkUnsavedChanges(action, newProject);
			break;

		case "open-project":
			await checkUnsavedChanges(action, openProjectBrowser);
			break;

		case "save-project":
			await saveProject();
			break;

		case "load-audio":
			await openAudioFile();
			break;

		case "save-image":
			await saveImage();
			break;

		case "save-video":
			await saveVideo();
			break;

		case "edit-canvas":
			await showModal("CanvasSettings", { title: "Canvas" });
			break;

		case "open-dev-tools":
			api.openDevTools();
			break;
	}
}

export async function loadPlugins() {
	logger.time("plugins");

	const plugins = {};

	for (const [key, plugin] of Object.entries(api.getPlugins())) {
		try {
			const module = await import(/* webpackIgnore: true */ plugin.src);

			module.default.config.icon = plugin.icon;

			plugins[key] = Plugin.create(module.default);
		} catch (e) {
			logger.error(e);
		}
	}

	library.set("plugins", plugins);

	logger.timeEnd("plugins", "Loaded plugins", plugins);
}

export async function loadLibrary() {
	const plugins = library.get("plugins");

	const coreDisplays = {};
	for (const [key, display] of Object.entries(displays)) {
		display.config.icon = `images/controls/${key}.png`;

		coreDisplays[key] = display;
	}

	const coreEffects = {};
	for (const [key, effect] of Object.entries(effects)) {
		effect.config.icon = `images/controls/${key}.png`;

		coreEffects[key] = effect;
	}

	for (const [key, plugin] of Object.entries(plugins)) {
		const { type } = plugin.config;

		if (type === "display") {
			coreDisplays[key] = plugin;
		} else if (type === "effect") {
			coreEffects[key] = plugin;
		}
	}

	library.set("displays", coreDisplays);
	library.set("effects", coreEffects);

	logger.log("Loaded library", library);
}

export async function initApp() {
	if (appInitialized) {
		return;
	}

	if (appInitPromise) {
		return appInitPromise;
	}

	appInitPromise = (async () => {
		await loadPlugins();
		await loadLibrary();
		await newProject();

		renderer.start();
		appInitialized = true;
	})().finally(() => {
		appInitPromise = null;
	});

	return appInitPromise;
}

export default appStore;

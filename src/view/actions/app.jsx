import Plugin from "@/core/Plugin";
import * as displays from "@/displays";
import * as effects from "@/effects";
import { openAudioFile } from "@/view/actions/audio";
import { signOut } from "@/view/actions/auth";
import { loadConfig } from "@/view/actions/config";
import { raiseError } from "@/view/actions/error";
import { showModal } from "@/view/actions/modals";
import {
	checkUnsavedChanges,
	duplicateProject,
	newProject,
	openProjectBrowser,
	openRelinkMediaDialog,
	saveProject,
} from "@/view/actions/project";
import { fitToScreen, setZoom, zoomIn, zoomOut } from "@/view/actions/stage";
import {
	api,
	env,
	library,
	logger,
	renderBackend,
	renderer,
} from "@/view/global";
import create from "zustand";

const initialState = {
	statusText: "",
	showControlDock: true,
	showPlayer: true,
	showReactor: false,
	showWaveform: true,
	showOsc: false,
	activeReactorId: null,
	activeElementId: null,
};

const appStore = create(() => ({
	...initialState,
}));

export function toggleState(key) {
	appStore.setState((state) => ({ [key]: !state[key] }));
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

		case "duplicate-project":
			await duplicateProject();
			break;

		case "load-audio":
			await openAudioFile();
			break;

		case "relink-media":
			await openRelinkMediaDialog();
			break;

		case "save-image":
			await saveImage();
			break;

		case "edit-canvas":
			await showModal("CanvasSettings", { title: "Canvas" });
			break;

		case "edit-settings":
			await showModal("AppSettings", { title: "Settings" });
			break;

		case "zoom-in":
			await zoomIn();
			break;

		case "zoom-out":
			await zoomOut();
			break;

		case "zoom-reset":
			await setZoom(1);
			break;

		case "zoom-fit":
			await fitToScreen();
			break;

		case "view-control-dock":
			await toggleState("showControlDock");
			break;

		case "view-player":
			await toggleState("showPlayer");
			break;

		case "open-dev-tools":
			api.openDevTools();
			break;

		case "about":
			await showModal("About");
			break;

		case "account":
			await showModal("AccountModal", { title: "Account" });
			break;

		case "sign-out":
			await signOut();
			break;
	}
}

export async function loadPlugins() {
	logger.time("plugins");

	const plugins = {};

	for (const [key, plugin] of Object.entries(api.getPlugins())) {
		try {
			const module = await import(
				/* webpackIgnore: true */ /* @vite-ignore */ plugin.src
			);

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
	await loadConfig();
	await loadPlugins();
	await loadLibrary();
	await newProject();

	if (!env.IS_WEB) {
		api.on("menu-action", handleMenuAction);
	}

	renderer.start();
}

export default appStore;

import { raiseError } from "actions/error";
import { showModal } from "actions/modals";
import { loadReactors, resetReactors } from "actions/reactors";
import { getScenesSnapshot, loadScenes, resetScenes } from "actions/scenes";
import { updateCanvas, updateStage } from "actions/stage";
import AudioReactor from "audio/AudioReactor";
import Display from "core/Display";
import Entity from "core/Entity";
import Scene from "core/Scene";
import Stage from "core/Stage";
import { api, env, library, logger, reactors, stage } from "global";
import { resetLabelCount } from "utils/controls";
import {
	DEFAULT_CANVAS_BGCOLOR,
	DEFAULT_CANVAS_HEIGHT,
	DEFAULT_CANVAS_WIDTH,
} from "view/constants";
import create from "zustand";

const initialState = {
	file: "",
	fileHandle: null,
	opened: 0,
	lastModified: 0,
};

const projectStore = create(() => ({
	...initialState,
}));

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
		data.reactors.forEach((config) => {
			const reactor = Entity.create(AudioReactor, config);

			reactors.addReactor(reactor);
		});
	}

	if (data.scenes) {
		data.scenes.forEach((config) => {
			const scene = Display.create(Scene, config);

			stage.addScene(scene);

			if (config.displays) {
				config.displays.forEach((display) => loadElement(scene, display));
			}

			if (config.effects) {
				config.effects.forEach((effect) => loadElement(scene, effect));
			}
		});
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
	await resetProject();
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

export async function loadProjectFile(file, fileHandle) {
	try {
		const data = await api.loadProjectFile(fileHandle || file);

		await loadProject(data);
		await loadScenes();
		await projectStore.setState({
			file: file?.name || file || "",
			fileHandle: fileHandle || null,
			opened: Date.now(),
			lastModified: 0,
		});
	} catch (e) {
		return raiseError("Invalid project file.", e);
	}
}

export async function saveProjectFile(file) {
	const { fileHandle } = projectStore.getState();
	const target = fileHandle || file;

	if (target) {
		const data = {
			version: env.APP_VERSION,
			stage: stage.toJSON(),
			scenes: getScenesSnapshot(),
			reactors: reactors.toJSON(),
		};

		logger.debug("Save data", data);

		try {
			const fileName =
				typeof target === "string"
					? target
					: target?.name || file?.name || "project.afx";

			await api.saveProjectFile(target, data, {
				fileName,
			});

			logger.log("Project saved:", fileName || "project", data);

			projectStore.setState({
				file: fileName,
				fileHandle: target && target.createWritable ? target : null,
				lastModified: 0,
			});

			return true;
		} catch (error) {
			raiseError("Failed to save project file.", error);
		}
	} else {
		const {
			fileHandle: newHandle,
			filePath,
			canceled,
		} = await api.showSaveDialog({
			defaultPath: "project.afx",
			filters: [{ name: "Project files", extensions: ["afx"] }],
		});

		if (!canceled) {
			await projectStore.setState({
				file: filePath || "project.afx",
				fileHandle: newHandle || null,
			});
			await saveProjectFile(newHandle || filePath);
		}
	}

	return false;
}

export async function openProjectFile() {
	const { files, fileHandles, canceled } = await api.showOpenDialog({
		filters: [{ name: "Project files", extensions: ["afx"] }],
	});

	if (!canceled && files && files.length) {
		const file = files[0];
		const handle = fileHandles ? fileHandles[0] : null;
		loadProjectFile(file, handle);
	}
}

export default projectStore;

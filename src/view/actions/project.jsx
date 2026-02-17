import { raiseError } from "actions/error";
import { showModal } from "actions/modals";
import { loadReactors, resetReactors } from "actions/reactors";
import {
	getScenesSnapshot,
	loadScenes,
	resetScenes,
	updateElementProperty,
} from "actions/scenes";
import { updateCanvas, updateStage } from "actions/stage";
import AudioReactor from "audio/AudioReactor";
import Display from "core/Display";
import Entity from "core/Entity";
import Scene from "core/Scene";
import Stage from "core/Stage";
import { api, env, library, logger, reactors, stage } from "global";
import cloneDeep from "lodash/cloneDeep";
import { resetLabelCount } from "utils/controls";
import {
	BLANK_IMAGE,
	DEFAULT_CANVAS_BGCOLOR,
	DEFAULT_CANVAS_HEIGHT,
	DEFAULT_CANVAS_WIDTH,
} from "view/constants";
import create from "zustand";

export const DEFAULT_PROJECT_NAME = "Untitled Project";

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
		scenes: getScenesSnapshot(),
		reactors: reactors.toJSON(),
	};
}

function sanitizeSnapshotMedia(snapshot) {
	const cloned = cloneDeep(snapshot);
	const mediaRefs = [];

	cloned.scenes = (cloned.scenes || []).map((scene) => {
		const mapMediaProps = (element) => {
			const src = element?.properties?.src;

			if (!src || src === BLANK_IMAGE || typeof src !== "string") {
				return element;
			}

			const kind = element.name === "VideoDisplay" ? "video" : "image";
			mediaRefs.push({
				displayId: element.id,
				kind,
				label: element.displayName || element.name || "Media",
			});

			return {
				...element,
				properties: {
					...element.properties,
					src: BLANK_IMAGE,
				},
			};
		};

		return {
			...scene,
			displays: (scene.displays || []).map(mapMediaProps),
			effects: (scene.effects || []).map(mapMediaProps),
		};
	});

	return {
		snapshot: cloned,
		mediaRefs,
	};
}

function setUnresolvedMediaRefs(mediaRefs = []) {
	projectStore.setState({
		unresolvedMediaRefs: mediaRefs,
	});
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

export function openProjectBrowser() {
	showModal("ProjectBrowser", { title: "Projects" });
}

export function openRelinkMediaDialog() {
	const { unresolvedMediaRefs } = projectStore.getState();

	if (unresolvedMediaRefs.length > 0) {
		showModal("RelinkMediaDialog", {
			title: "Relink Media",
		});
	}
}

export async function listProjects() {
	const response = await api.listProjects();
	return response.projects || [];
}

export async function loadProjectById(projectId) {
	try {
		const response = await api.getProjectById(projectId);
		const { project, revision } = response;

		if (!project) {
			throw new Error("Project not found.");
		}

		if (revision?.snapshot) {
			loadProject(revision.snapshot);
			await loadScenes();
		} else {
			await newProject();
		}

		projectStore.setState({
			projectId: project.id,
			projectName: project.name || DEFAULT_PROJECT_NAME,
			opened: Date.now(),
			lastModified: 0,
			unresolvedMediaRefs: revision?.mediaRefs || [],
		});

		if ((revision?.mediaRefs || []).length > 0) {
			openRelinkMediaDialog();
		}
	} catch (error) {
		raiseError("Failed to load project.", error);
	}
}

export async function renameProjectById(projectId, name) {
	const response = await api.renameProject(projectId, name);
	const { project } = response;

	if (project?.id === projectStore.getState().projectId) {
		projectStore.setState({
			projectName: project.name,
		});
	}

	return project;
}

export async function deleteProjectById(projectId) {
	await api.deleteProjectById(projectId);

	if (projectStore.getState().projectId === projectId) {
		await newProject();
	}
}

export async function saveProject(nameOverride) {
	const state = projectStore.getState();
	const name = (
		nameOverride ||
		state.projectName ||
		DEFAULT_PROJECT_NAME
	).trim();
	let projectId = state.projectId;

	try {
		if (!projectId) {
			const created = await api.createProject(name);
			projectId = created.project.id;
		}

		const { snapshot, mediaRefs } = sanitizeSnapshotMedia(snapshotProject());

		await api.createProjectRevision(projectId, snapshot, mediaRefs);

		projectStore.setState({
			projectId,
			projectName: name,
			opened: Date.now(),
			lastModified: 0,
		});

		logger.log("Project saved:", name);
		return true;
	} catch (error) {
		raiseError("Failed to save project.", error);
		return false;
	}
}

export async function duplicateProject() {
	const { projectId, projectName } = projectStore.getState();

	try {
		if (!projectId) {
			return saveProject(`${projectName || DEFAULT_PROJECT_NAME} copy`);
		}

		const duplicated = await api.duplicateProjectById(
			projectId,
			`${projectName || DEFAULT_PROJECT_NAME} copy`,
		);

		await loadProjectById(duplicated.project.id);

		return true;
	} catch (error) {
		raiseError("Failed to duplicate project.", error);
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
		const src = isVideo
			? await api.readVideoFile(file)
			: await api.readImageFile(file);

		updateElementProperty(mediaRef.displayId, "src", src);

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

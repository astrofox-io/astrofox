import { stage } from "global";
import create from "zustand";
import { touchProject } from "./project";

const initialState = {
	scenes: [],
};

const sceneStore = create(() => ({
	...initialState,
}));

export function loadScenes(touch = true) {
	sceneStore.setState({ scenes: stage.scenes.toJSON() });

	if (touch) {
		touchProject();
	}
}

export function resetScenes(touch = true) {
	sceneStore.setState({ ...initialState });

	stage.clearScenes();

	if (touch) {
		touchProject();
	}
}

export function addScene() {
	const scene = stage.addScene();

	loadScenes();

	return scene;
}

export function addElement(element, sceneId) {
	const scene = sceneId ? stage.getSceneById(sceneId) : stage.scenes[0];

	if (scene) {
		scene.addElement(element);
	}

	loadScenes();
}

export function updateElement(id, prop, value) {
	const element = stage.getStageElementById(id);

	if (element) {
		element[prop] = value;

		loadScenes();
	}
}

export function updateElementProperty(id, prop, value) {
	const element = stage.getStageElementById(id);

	if (element) {
		element.update({ [prop]: value });

		loadScenes();
	}
}

export function removeElement(id) {
	const element = stage.getStageElementById(id);

	if (element) {
		stage.removeStageElement(element);

		loadScenes();
	}
}

export function moveElement(id, spaces) {
	const element = stage.getStageElementById(id);

	if (element) {
		stage.shiftStageElement(element, spaces);

		loadScenes();
	}
}

export default sceneStore;

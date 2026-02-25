// @ts-nocheck
import { stage } from "@/lib/view/global";
import cloneDeep from "lodash/cloneDeep";
import create from "zustand";
import { touchProject } from "./project";

const initialState = {
	scenes: [],
	sceneOrder: [],
	sceneById: {},
	elementById: {},
	sceneElementsById: {},
	elementParentSceneId: {},
};

const sceneStore = create(() => ({
	...initialState,
}));

function normalizeScenes(scenes) {
	const sceneOrder = [];
	const sceneById = {};
	const elementById = {};
	const sceneElementsById = {};
	const elementParentSceneId = {};

	for (const scene of scenes) {
		sceneOrder.push(scene.id);
		sceneById[scene.id] = scene;

		const displayIds = [];
		for (const display of scene.displays || []) {
			displayIds.push(display.id);
			elementById[display.id] = display;
			elementParentSceneId[display.id] = scene.id;
		}

		const effectIds = [];
		for (const effect of scene.effects || []) {
			effectIds.push(effect.id);
			elementById[effect.id] = effect;
			elementParentSceneId[effect.id] = scene.id;
		}

		sceneElementsById[scene.id] = {
			displays: displayIds,
			effects: effectIds,
		};
	}

	return {
		scenes,
		sceneOrder,
		sceneById,
		elementById,
		sceneElementsById,
		elementParentSceneId,
	};
}

function setScenesState(scenes, touch = true) {
	sceneStore.setState(normalizeScenes(scenes));

	if (touch) {
		touchProject();
	}
}

function getElementTarget(type) {
	return type === "effect" ? "effects" : "displays";
}

function updateScenes(callback) {
	const scenes = sceneStore.getState().scenes;
	const nextScenes = callback(scenes);

	if (nextScenes) {
		setScenesState(nextScenes);
	}

	return nextScenes;
}

export function loadScenes(touch = true) {
	setScenesState(stage.scenes.toJSON(), touch);
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

	updateScenes((scenes) => [...scenes, scene.toJSON()]);

	return scene;
}

export function addElement(element, sceneId) {
	const { scenes } = sceneStore.getState();
	const targetSceneId = sceneId || scenes[0]?.id;
	const target = getElementTarget(element.type);

	if (!targetSceneId) {
		return;
	}

	const nextElement = element.toJSON();

	updateScenes((currentScenes) =>
		currentScenes.map((scene) => {
			if (scene.id !== targetSceneId) {
				return scene;
			}

			return {
				...scene,
				[target]: [...scene[target], nextElement],
			};
		}),
	);

	const scene = stage.getSceneById(targetSceneId) || stage.scenes[0];

	if (scene) {
		scene.addElement(element);
	}
}

export function updateElement(id, prop, value) {
	updateScenes((scenes) =>
		scenes.map((scene) => {
			if (scene.id === id) {
				return { ...scene, [prop]: value };
			}

			const displays = scene.displays.map((display) =>
				display.id === id ? { ...display, [prop]: value } : display,
			);
			const effects = scene.effects.map((effect) =>
				effect.id === id ? { ...effect, [prop]: value } : effect,
			);

			if (displays !== scene.displays || effects !== scene.effects) {
				return { ...scene, displays, effects };
			}

			return scene;
		}),
	);

	const element = stage.getStageElementById(id);

	if (element) {
		element[prop] = value;
	}
}

export function updateElementProperty(id, prop, value) {
	updateScenes((scenes) =>
		scenes.map((scene) => {
			const displays = scene.displays.map((display) =>
				display.id === id
					? {
							...display,
							properties: { ...display.properties, [prop]: value },
						}
					: display,
			);
			const effects = scene.effects.map((effect) =>
				effect.id === id
					? {
							...effect,
							properties: { ...effect.properties, [prop]: value },
						}
					: effect,
			);

			if (displays !== scene.displays || effects !== scene.effects) {
				return { ...scene, displays, effects };
			}

			return scene;
		}),
	);

	const element = stage.getStageElementById(id);

	if (element) {
		element.update({ [prop]: value });
	}
}

export function removeElement(id) {
	updateScenes((scenes) => {
		const sceneIndex = scenes.findIndex((scene) => scene.id === id);

		if (sceneIndex > -1) {
			return scenes.filter((scene) => scene.id !== id);
		}

		let hasChanges = false;
		const nextScenes = scenes.map((scene) => {
			const displays = scene.displays.filter((display) => display.id !== id);
			const effects = scene.effects.filter((effect) => effect.id !== id);

			if (
				displays.length !== scene.displays.length ||
				effects.length !== scene.effects.length
			) {
				hasChanges = true;
				return { ...scene, displays, effects };
			}

			return scene;
		});

		return hasChanges ? nextScenes : scenes;
	});

	const element = stage.getStageElementById(id);

	if (element) {
		stage.removeStageElement(element);
	}
}

function swapAtIndex(items, index, spaces) {
	const newIndex = index + spaces;

	if (
		index === newIndex ||
		index < 0 ||
		index >= items.length ||
		newIndex < 0 ||
		newIndex >= items.length
	) {
		return items;
	}

	const nextItems = [...items];
	const tmp = nextItems[index];
	nextItems[index] = nextItems[newIndex];
	nextItems[newIndex] = tmp;

	return nextItems;
}

export function moveElement(id, spaces) {
	updateScenes((scenes) => {
		const sceneIndex = scenes.findIndex((scene) => scene.id === id);

		if (sceneIndex > -1) {
			return swapAtIndex(scenes, sceneIndex, spaces);
		}

		return scenes.map((scene) => {
			const displayIndex = scene.displays.findIndex(
				(display) => display.id === id,
			);
			if (displayIndex > -1) {
				return {
					...scene,
					displays: swapAtIndex(scene.displays, displayIndex, spaces),
				};
			}

			const effectIndex = scene.effects.findIndex((effect) => effect.id === id);
			if (effectIndex > -1) {
				return {
					...scene,
					effects: swapAtIndex(scene.effects, effectIndex, spaces),
				};
			}

			return scene;
		});
	});

	const element = stage.getStageElementById(id);

	if (element) {
		stage.shiftStageElement(element, spaces);
	}
}

export function getScenesSnapshot() {
	return cloneDeep(sceneStore.getState().scenes);
}

export default sceneStore;

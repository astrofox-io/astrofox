// @ts-nocheck
import { stage } from "@/app/global";
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

function insertAtIndex(items, index, item) {
	const nextItems = [...items];
	const normalizedIndex = Math.max(0, Math.min(index, nextItems.length));
	nextItems.splice(normalizedIndex, 0, item);
	return nextItems;
}

function findElementLocation(scenes, id) {
	const sceneIndex = scenes.findIndex((scene) => scene.id === id);

	if (sceneIndex > -1) {
		return {
			type: "scene",
			sceneId: id,
			index: sceneIndex,
		};
	}

	for (const scene of scenes) {
		const displayIndex = scene.displays.findIndex((display) => display.id === id);
		if (displayIndex > -1) {
			return {
				type: "display",
				sceneId: scene.id,
				index: displayIndex,
			};
		}

		const effectIndex = scene.effects.findIndex((effect) => effect.id === id);
		if (effectIndex > -1) {
			return {
				type: "effect",
				sceneId: scene.id,
				index: effectIndex,
			};
		}
	}

	return null;
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

function moveAtIndex(items, fromIndex, toIndex) {
	if (
		fromIndex === toIndex ||
		fromIndex < 0 ||
		toIndex < 0 ||
		fromIndex >= items.length ||
		toIndex >= items.length
	) {
		return items;
	}

	const nextItems = [...items];
	const [item] = nextItems.splice(fromIndex, 1);
	nextItems.splice(toIndex, 0, item);

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

export function reorderElement(sourceId, targetId) {
	if (!sourceId || !targetId || sourceId === targetId) {
		return false;
	}

	const scenes = sceneStore.getState().scenes;
	const source = findElementLocation(scenes, sourceId);
	const target = findElementLocation(scenes, targetId);

	if (!source || !target) {
		return false;
	}

	if (source.type === "scene" || target.type === "scene") {
		if (source.type !== "scene" && target.type !== "scene") {
			return false;
		}

		if (source.type === "scene") {
			updateScenes((currentScenes) =>
				moveAtIndex(currentScenes, source.index, target.index),
			);

			const scene = stage.getSceneById(sourceId);
			if (!scene) {
				return true;
			}

			const offset = target.index - source.index;
			const direction = Math.sign(offset);
			const distance = Math.abs(offset);

			for (let i = 0; i < distance; i += 1) {
				stage.shiftStageElement(scene, direction);
			}

			return true;
		}

		const sourceCollection = getElementTarget(source.type);
		const sourceScene = scenes.find((scene) => scene.id === source.sceneId);
		const sourceItem = sourceScene?.[sourceCollection]?.[source.index];

		if (!sourceScene || !sourceItem) {
			return false;
		}

		updateScenes((currentScenes) =>
			currentScenes.map((scene) => {
				if (scene.id === source.sceneId && scene.id === target.sceneId) {
					const nextItems = [...scene[sourceCollection]];
					nextItems.splice(source.index, 1);
					nextItems.push(sourceItem);
					return {
						...scene,
						[sourceCollection]: nextItems,
					};
				}

				if (scene.id === source.sceneId) {
					return {
						...scene,
						[sourceCollection]: scene[sourceCollection].filter(
							(item) => item.id !== sourceId,
						),
					};
				}

				if (scene.id === target.sceneId) {
					return {
						...scene,
						[sourceCollection]: [...scene[sourceCollection], sourceItem],
					};
				}

				return scene;
			}),
		);

		const element = stage.getStageElementById(sourceId);
		const sourceSceneInstance = stage.getSceneById(source.sceneId);
		const targetSceneInstance = stage.getSceneById(target.sceneId);

		if (!element || !sourceSceneInstance || !targetSceneInstance) {
			return true;
		}

		sourceSceneInstance.removeElement(element);
		targetSceneInstance.addElement(element);
		return true;
	}

	if (source.type !== target.type) {
		return false;
	}

	if (source.sceneId !== target.sceneId) {
		const targetCollection = getElementTarget(source.type);
		const sourceScene = scenes.find((scene) => scene.id === source.sceneId);
		const targetScene = scenes.find((scene) => scene.id === target.sceneId);
		const sourceItem = sourceScene?.[targetCollection]?.[source.index];

		if (!sourceScene || !targetScene || !sourceItem) {
			return false;
		}

		updateScenes((currentScenes) =>
			currentScenes.map((scene) => {
				if (scene.id === source.sceneId) {
					return {
						...scene,
						[targetCollection]: scene[targetCollection].filter(
							(item) => item.id !== sourceId,
						),
					};
				}

				if (scene.id === target.sceneId) {
					return {
						...scene,
						[targetCollection]: insertAtIndex(
							scene[targetCollection],
							target.index,
							sourceItem,
						),
					};
				}

				return scene;
			}),
		);

		const element = stage.getStageElementById(sourceId);
		const sourceSceneInstance = stage.getSceneById(source.sceneId);
		const targetSceneInstance = stage.getSceneById(target.sceneId);

		if (!element || !sourceSceneInstance || !targetSceneInstance) {
			return true;
		}

		sourceSceneInstance.removeElement(element);
		targetSceneInstance.addElement(element, target.index);
		return true;
	}

	updateScenes((currentScenes) =>
		currentScenes.map((scene) => {
			if (scene.id !== source.sceneId) {
				return scene;
			}

			if (source.type === "display") {
				return {
					...scene,
					displays: moveAtIndex(scene.displays, source.index, target.index),
				};
			}

			return {
				...scene,
				effects: moveAtIndex(scene.effects, source.index, target.index),
			};
		}),
	);

	const element = stage.getStageElementById(sourceId);
	if (!element) {
		return true;
	}

	const offset = target.index - source.index;
	const direction = Math.sign(offset);
	const distance = Math.abs(offset);

	for (let i = 0; i < distance; i += 1) {
		stage.shiftStageElement(element, direction);
	}

	return true;
}

export function getScenesSnapshot() {
	return cloneDeep(sceneStore.getState().scenes);
}

export default sceneStore;

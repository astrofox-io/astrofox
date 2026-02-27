// @ts-nocheck
import Entity from "@/lib/core/Entity";
import EntityList from "@/lib/core/EntityList";
import Scene from "@/lib/core/Scene";
import { isDefined } from "@/lib/utils/array";
import {
	DEFAULT_CANVAS_BGCOLOR,
	DEFAULT_CANVAS_HEIGHT,
	DEFAULT_CANVAS_WIDTH,
} from "@/lib/view/constants";
import cloneDeep from "lodash/cloneDeep";

export default class Stage extends Entity {
	[key: string]: any;
	static defaultProperties = {
		width: DEFAULT_CANVAS_WIDTH,
		height: DEFAULT_CANVAS_HEIGHT,
		backgroundColor: DEFAULT_CANVAS_BGCOLOR,
		zoom: 1,
	};

	constructor(properties) {
		super("Stage", { ...Stage.defaultProperties, ...properties });

		this.scenes = new EntityList();
	}

	update(properties) {
		const { width, height } = properties;
		const changed = super.update(properties);

		if (changed && isDefined(width, height)) {
			this.scenes.forEach((scene) => {
				scene.setSize(width, height);
			});
		}

		return changed;
	}

	getSize() {
		return {
			width: this.properties.width || 1,
			height: this.properties.height || 1,
		};
	}

	getSceneById(id) {
		return this.scenes.getElementById(id);
	}

	getStageElementById(id) {
		return this.scenes.reduce((element, scene) => {
			if (!element) {
				element = scene.getElementById(id);
			}
			return element;
		}, this.getSceneById(id));
	}

	removeStageElement(obj) {
		if (obj instanceof Scene) {
			this.removeScene(obj);
		} else {
			const scene = this.getSceneById(obj.scene.id);
			if (scene) {
				scene.removeElement(obj);
			}
		}
	}

	shiftStageElement(obj, spaces) {
		if (obj instanceof Scene) {
			return this.scenes.shiftElement(obj, spaces);
		}

		const scene = this.getSceneById(obj.scene.id);

		if (scene) {
			return scene.shiftElement(obj, spaces);
		}

		return false;
	}

	addScene(scene = new Scene(), index) {
		this.scenes.addElement(scene, index);

		scene.stage = this;

		return scene;
	}

	removeScene(scene) {
		this.scenes.removeElement(scene);
		scene.stage = null;
	}

	clearScenes() {
		[...this.scenes].forEach((scene) => this.removeScene(scene));
	}

	hasScenes() {
		return !this.scenes.isEmpty();
	}

	toJSON() {
		const { id, name, type, properties } = this;

		return {
			id,
			name,
			type,
			properties: cloneDeep(properties),
		};
	}
}

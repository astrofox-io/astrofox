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
	[key: string]: unknown;

	static defaultProperties = {
		width: DEFAULT_CANVAS_WIDTH,
		height: DEFAULT_CANVAS_HEIGHT,
		backgroundColor: DEFAULT_CANVAS_BGCOLOR,
		zoom: 1,
	};

	declare scenes: EntityList;

	constructor(properties?: Record<string, unknown>) {
		super("Stage", { ...Stage.defaultProperties, ...properties });

		this.scenes = new EntityList();
	}

	update(properties: Record<string, unknown>) {
		const { width, height } = properties as {
			width?: number;
			height?: number;
		};
		const changed = super.update(properties);

		if (changed && isDefined(width, height)) {
			this.scenes.forEach(
				(scene: { setSize: (w: number, h: number) => void }) => {
					scene.setSize(width as number, height as number);
				},
			);
		}

		return changed;
	}

	getSize(): { width: number; height: number } {
		const props = this.properties as Record<string, unknown>;
		return {
			width: (props.width as number) || 1,
			height: (props.height as number) || 1,
		};
	}

	getSceneById(id: string) {
		return this.scenes.getElementById(id);
	}

	getStageElementById(id: string) {
		return this.scenes.reduce(
			(
				element: unknown,
				scene: { getElementById: (id: string) => unknown },
			) => {
				if (!element) {
					element = scene.getElementById(id);
				}
				return element;
			},
			this.getSceneById(id),
		);
	}

	removeStageElement(obj: unknown) {
		if (obj instanceof Scene) {
			this.removeScene(obj);
		} else {
			const element = obj as { scene: { id: string } };
			const scene = this.getSceneById(element.scene.id) as Scene | undefined;
			if (scene) {
				scene.removeElement(
					obj as {
						id: string;
						scene: unknown;
						toJSON: () => Record<string, unknown>;
					},
				);
			}
		}
	}

	shiftStageElement(obj: unknown, spaces: number) {
		if (obj instanceof Scene) {
			return this.scenes.shiftElement(obj, spaces);
		}

		const element = obj as { scene: { id: string } };
		const scene = this.getSceneById(element.scene.id) as Scene | undefined;

		if (scene) {
			return scene.shiftElement(obj, spaces);
		}

		return false;
	}

	addScene(scene?: unknown, index?: number) {
		const sceneInstance = (scene ?? new Scene()) as Scene;
		this.scenes.addElement(sceneInstance, index);

		sceneInstance.stage = this;

		return sceneInstance;
	}

	removeScene(scene: unknown) {
		this.scenes.removeElement(scene);
		(scene as Scene).stage = null;
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

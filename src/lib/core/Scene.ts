import Display from "@/lib/core/Display";
import Effect from "@/lib/core/Effect";
import EntityList from "@/lib/core/EntityList";

const blendOptions = [
	"None",
	"Normal",
	null,
	"Darken",
	"Multiply",
	"Color Burn",
	"Linear Burn",
	null,
	"Lighten",
	"Screen",
	"Color Dodge",
	"Linear Dodge",
	null,
	"Overlay",
	"Soft Light",
	"Hard Light",
	"Vivid Light",
	"Linear Light",
	"Pin Light",
	"Hard Mix",
	null,
	"Difference",
	"Exclusion",
	"Subtract",
	"Divide",
	null,
	"Negation",
	"Phoenix",
	"Glow",
	"Reflect",
];

interface SceneElement {
	id: string;
	scene: unknown;
	setSize?: (width: number, height: number) => void;
	addToScene?: (scene: {
		getSize: () => { width: number; height: number };
	}) => void;
	removeFromScene?: (scene: Scene) => void;
	toJSON: () => Record<string, unknown>;
}

export default class Scene extends Display {
	[key: string]: unknown;

	static config = {
		name: "Scene",
		description: "Scene display.",
		type: "display",
		label: "Scene",

		defaultProperties: {
			blendMode: "Normal",
			opacity: 1.0,
			mask: false,
			inverse: false,
			stencil: false,
		},
		controls: {
			blendMode: {
				label: "Blending",
				type: "select",
				items: blendOptions,
			},
			opacity: {
				label: "Opacity",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			mask: {
				label: "Mask",
				type: "toggle",
			},
			inverse: {
				label: "Inverse",
				type: "toggle",
				hidden: (display: { properties: Record<string, unknown> }) =>
					!display.properties.mask,
			},
		},
	};

	declare displays: EntityList;
	declare effects: EntityList;
	declare stage: unknown;

	constructor(properties?: Record<string, unknown>) {
		super(Scene, properties);

		this.stage = null;
		this.displays = new EntityList();
		this.effects = new EntityList();

		this.getSize = this.getSize.bind(this);
	}

	getSize(): { width: number; height: number } {
		const stage = this.stage as {
			getSize?: () => { width: number; height: number };
		} | null;
		if (stage?.getSize) {
			return stage.getSize();
		}

		return { width: 1, height: 1 };
	}

	setSize(width: number, height: number) {
		this.displays.forEach((display: SceneElement) => {
			if (display.setSize) {
				display.setSize(width, height);
			}
		});

		this.effects.forEach((effect: SceneElement) => {
			if (effect.setSize) {
				effect.setSize(width, height);
			}
		});
	}

	getTarget(obj: unknown): EntityList {
		return obj instanceof Effect ? this.effects : this.displays;
	}

	getElementById(id: string) {
		return this.displays.getElementById(id) || this.effects.getElementById(id);
	}

	hasElement(obj: SceneElement) {
		return !!this.getElementById(obj.id);
	}

	addElement(obj: SceneElement, index?: number) {
		if (!obj) {
			return;
		}

		const { getSize } = this;
		const scene = { getSize } as {
			getSize: () => { width: number; height: number };
		};

		const target = this.getTarget(obj);

		target.addElement(obj, index);

		obj.scene = this;

		if (obj.addToScene) {
			obj.addToScene(scene);
		}

		if (obj.setSize) {
			const stage = this.stage as {
				getSize: () => { width: number; height: number };
			};
			const { width, height } = stage.getSize();

			obj.setSize(width, height);
		}

		return obj;
	}

	removeElement(obj: SceneElement) {
		if (!this.hasElement(obj)) {
			return false;
		}

		const target = this.getTarget(obj);

		target.removeElement(obj);

		obj.scene = null;

		if (obj.removeFromScene) {
			obj.removeFromScene(this);
		}

		return true;
	}

	shiftElement(obj: unknown, spaces: number) {
		const element = obj as SceneElement;
		if (!this.hasElement(element)) {
			return false;
		}

		const target = this.getTarget(obj);

		return target.shiftElement(obj, spaces);
	}

	toJSON() {
		const json = super.toJSON();
		const { displays, effects } = this;

		return {
			...json,
			displays: displays.map((display: SceneElement) => display.toJSON()),
			effects: effects.map((effect: SceneElement) => effect.toJSON()),
		};
	}
}

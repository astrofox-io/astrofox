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

export default class Scene extends Display {
	[key: string]: any;
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
				hidden: (display) => !display.properties.mask,
			},
		},
	};

	constructor(properties) {
		super(Scene, properties);

		this.stage = null;
		this.displays = new EntityList();
		this.effects = new EntityList();

		this.getSize = this.getSize.bind(this);
	}

	getSize() {
		if (this.stage?.getSize) {
			return this.stage.getSize();
		}

		return { width: 1, height: 1 };
	}

	setSize(width, height) {
		this.displays.forEach((display) => {
			if (display.setSize) {
				display.setSize(width, height);
			}
		});

		this.effects.forEach((effect) => {
			if (effect.setSize) {
				effect.setSize(width, height);
			}
		});
	}

	getTarget(obj) {
		return obj instanceof Effect ? this.effects : this.displays;
	}

	getElementById(id) {
		return this.displays.getElementById(id) || this.effects.getElementById(id);
	}

	hasElement(obj) {
		return !!this.getElementById(obj.id);
	}

	addElement(obj, index) {
		if (!obj) {
			return;
		}

		const { getSize } = this;
		const scene = { getSize };

		const target = this.getTarget(obj);

		target.addElement(obj, index);

		obj.scene = this;

		if (obj.addToScene) {
			obj.addToScene(scene);
		}

		if (obj.setSize) {
			const { width, height } = this.stage.getSize();

			obj.setSize(width, height);
		}

		return obj;
	}

	removeElement(obj) {
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

	shiftElement(obj, spaces) {
		if (!this.hasElement(obj)) {
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
			displays: displays.map((display) => display.toJSON()),
			effects: effects.map((effect) => effect.toJSON()),
		};
	}
}

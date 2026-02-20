import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import MirrorShader from "@/lib/shaders/MirrorShader";

const mirrorOptions = [
	{ label: "Left 🠖 Right", value: 0 },
	{ label: "Right 🠖 Left", value: 1 },
	{ label: "Top 🠖 Bottom", value: 2 },
	{ label: "Bottom 🠖 Top", value: 3 },
];

export default class MirrorEffect extends Effect {
	static config = {
		name: "MirrorEffect",
		description: "Mirror effect.",
		type: "effect",
		label: "Mirror",
		defaultProperties: {
			side: 0,
		},
		controls: {
			side: {
				label: "Side",
				type: "select",
				items: mirrorOptions,
			},
		},
	};

	constructor(properties) {
		super(MirrorEffect, properties);
	}

	addToScene() {
		this.pass = new ShaderPass(MirrorShader);
	}

	removeFromScene() {
		this.pass = null;
	}
}

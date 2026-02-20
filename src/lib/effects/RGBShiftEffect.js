import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import RGBShiftShader from "@/lib/shaders/RGBShiftShader";
import { stageWidth } from "@/lib/utils/controls";
import { deg2rad } from "@/lib/utils/math";

export default class RGBShiftEffect extends Effect {
	static config = {
		name: "RGBShiftEffect",
		description: "RGB shift effect.",
		type: "effect",
		label: "RGB Shift",
		defaultProperties: {
			offset: 5,
			angle: 45,
		},
		controls: {
			offset: {
				label: "Offset",
				type: "number",
				min: 0,
				max: stageWidth(),
				withRange: true,
				withReactor: true,
			},
			angle: {
				label: "Angle",
				type: "number",
				min: 0,
				max: 360,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(RGBShiftEffect, properties);
	}

	updatePass() {
		const { width } = this.scene.getSize();

		this.pass.setUniforms({
			amount: this.properties.offset / width,
			angle: deg2rad(this.properties.angle),
		});
	}

	addToScene() {
		this.pass = new ShaderPass(RGBShiftShader);
		this.pass.enabled = this.enabled;
	}

	removeFromScene() {
		this.pass = null;
	}
}

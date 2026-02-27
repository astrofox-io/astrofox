import Effect from "@/lib/core/Effect";

export default class DistortionEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "DistortionEffect",
		description: "Distortion effect.",
		type: "effect",
		label: "Distortion",
		defaultProperties: {
			time: 0,
			amount: 0.15,
			speed: 0.5,
		},
		controls: {
			amount: {
				label: "Amount",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			speed: {
				label: "Speed",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(DistortionEffect, properties);

		this.time = 0;
	}

	render(scene, data) {
		if (!data.hasUpdate) return;

		const { speed } = this.properties;

		if (speed > 0) {
			this.time += data.delta / (100 / speed);
		}
	}
}

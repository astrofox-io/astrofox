import Effect from "@/lib/core/Effect";
import type { RenderFrameData } from "@/lib/types";

export default class DistortionEffect extends Effect {
	declare time: number;

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

	constructor(properties?: Record<string, unknown>) {
		super(DistortionEffect, properties);

		this.time = 0;
	}

	render(scene: unknown, data: RenderFrameData) {
		if (!data.hasUpdate) return;

		const { speed } = this.properties as Record<string, unknown>;

		if ((speed as number) > 0) {
			this.time += data.delta / (100 / (speed as number));
		}
	}
}

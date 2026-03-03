import Effect from "@/lib/core/Effect";
import type { RenderFrameData } from "@/lib/types";

export default class GlitchEffect extends Effect {
	declare time: number;

	static config = {
		name: "GlitchEffect",
		description: "Glitch effect.",
		type: "effect",
		label: "Glitch",
		defaultProperties: {
			amount: 0.5,
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
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(GlitchEffect, properties);

		this.time = 0;
	}

	render(scene: unknown, data: RenderFrameData) {
		if (!data.hasUpdate) return;

		this.time += data.delta;
	}
}

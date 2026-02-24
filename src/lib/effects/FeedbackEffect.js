import Effect from "@/lib/core/Effect";
import FeedbackPass from "@/lib/effects/passes/FeedbackPass";

export default class FeedbackEffect extends Effect {
	static config = {
		name: "FeedbackEffect",
		description: "Frame feedback echo that accumulates previous frames with decay.",
		type: "effect",
		label: "Feedback Echo",
		defaultProperties: {
			decay: 0.85,
			zoom: 1.0,
		},
		controls: {
			decay: {
				label: "Decay",
				type: "number",
				min: 0,
				max: 0.99,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			zoom: {
				label: "Zoom",
				type: "number",
				min: 1.0,
				max: 1.1,
				step: 0.001,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(FeedbackEffect, properties);
	}

	updatePass() {
		const { decay, zoom } = this.properties;
		this.pass.setUniforms({ decay, zoom });
	}

	addToScene() {
		this.pass = new FeedbackPass();
		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}
}

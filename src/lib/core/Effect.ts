import Display from "@/lib/core/Display";

export default class Effect extends Display {
	[key: string]: any;
	constructor(Type, properties) {
		super(Type, properties);

		this.type = "effect";
	}

	update(properties: any = {}) {
		const changed = super.update(properties);

		if (changed) {
			this.updatePass();
		}

		return changed;
	}

	updatePass() {
		const { pass } = this;

		if (pass.setUniforms) {
			pass.setUniforms(this.properties);
		}
	}

	setSize(width, height) {
		const { pass } = this;

		if (pass) {
			pass.setSize(width, height);
		}
	}

	render() {}
}

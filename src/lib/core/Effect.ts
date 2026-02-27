import Display from "@/lib/core/Display";

export default class Effect extends Display {
	[key: string]: any;
	constructor(Type, properties) {
		super(Type, properties);

		this.type = "effect";
	}

	update(properties: any = {}) {
		return super.update(properties);
	}

	updatePass() {}

	render(..._args: any[]) {}
}

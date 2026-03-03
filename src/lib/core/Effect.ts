import Display from "@/lib/core/Display";

export default class Effect extends Display {
	[key: string]: unknown;

	constructor(
		Type: {
			config: {
				name: string;
				label: string;
				defaultProperties: Record<string, unknown>;
			};
		},
		properties?: Record<string, unknown>,
	) {
		super(Type, properties);

		this.type = "effect";
	}

	update(properties?: Record<string, unknown>) {
		return super.update(properties);
	}

	updatePass() {}

	render(..._args: unknown[]) {}
}

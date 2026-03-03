import Display from "./Display";
import Effect from "./Effect";

interface PluginModule {
	config: {
		name: string;
		label: string;
		type: string;
		defaultProperties: Record<string, unknown>;
	};
	prototype: Record<string, unknown>;
	[key: string]: unknown;
}

export default class Plugin {
	static create(module: PluginModule) {
		const Type = module.config.type === "effect" ? Effect : Display;

		class PluginClass extends Type {
			[key: string]: unknown;

			constructor(properties?: Record<string, unknown>) {
				super(module, properties);
			}
		}

		Object.getOwnPropertyNames(module).forEach((name) => {
			if (
				(PluginClass as unknown as Record<string, unknown>)[name] === undefined
			) {
				(PluginClass as unknown as Record<string, unknown>)[name] =
					module[name];
			}
		});

		Object.getOwnPropertyNames(module.prototype).forEach((name) => {
			if (name !== "constructor") {
				(PluginClass.prototype as Record<string, unknown>)[name] =
					module.prototype[name];
			}
		});

		return PluginClass;
	}
}

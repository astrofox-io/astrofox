// @ts-nocheck
import Display from "./Display";
import Effect from "./Effect";

export default class Plugin {
	[key: string]: any;
	static create(module) {
		const Type = module.config.type === "effect" ? Effect : Display;

		class PluginClass extends Type {
			[key: string]: any;
			constructor(properties) {
				super(module, properties);
			}
		}

		Object.getOwnPropertyNames(module).forEach((name) => {
			if (PluginClass[name] === undefined) {
				PluginClass[name] = module[name];
			}
		});

		Object.getOwnPropertyNames(module.prototype).forEach((name) => {
			if (name !== "constructor") {
				PluginClass.prototype[name] = module.prototype[name];
			}
		});

		return PluginClass;
	}
}

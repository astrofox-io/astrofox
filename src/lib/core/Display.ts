// @ts-nocheck
import Entity from "@/lib/core/Entity";
import { getDisplayName } from "@/lib/utils/controls";
import cloneDeep from "lodash/cloneDeep";

export default class Display extends Entity {
	[key: string]: any;
	static create = (Type, config) => {
		const { reactors = {} } = config;
		const entity = Entity.create(Type, config);

		for (const [key, value] of Object.entries(reactors)) {
			entity.setReactor(key, value);
		}

		return entity;
	};

	constructor(Type, properties) {
		const {
			config: { name, label, defaultProperties },
		} = Type;

		super(name, { ...defaultProperties, ...properties });

		Object.defineProperties(this, {
			type: { value: "display", writable: true, enumerable: true },
			displayName: {
				value: getDisplayName(label),
				writable: true,
				enumerable: true,
			},
			enabled: { value: true, writable: true, enumerable: true },
			scene: { value: null, writable: true, enumerable: true },
			reactors: { value: {}, writable: true, enumerable: true },
		});
	}

	getReactor(prop) {
		return this.reactors[prop];
	}

	setReactor(prop, config) {
		this.reactors[prop] = config;
	}

	removeReactor(prop) {
		delete this.reactors[prop];
	}

	clearReactors() {
		this.reactors = {};
	}

	updateReactors(data) {
		if (!data.hasUpdate) {
			return;
		}

		const { reactors } = this;
		const properties = {};
		let hasUpdate = false;

		for (const [key, value] of Object.entries(reactors as any)) {
			const { id, min, max } = value;
			const output = data.reactors[id];

			if (output !== undefined) {
				properties[key] = (max - min) * output + min;
				hasUpdate = true;
			}
		}

		if (hasUpdate) {
			this.update(properties);
		}
	}

	toJSON(): any {
		const { id, name, type, enabled, displayName, properties, reactors } = this;

		return {
			id,
			name,
			type,
			enabled,
			displayName,
			properties: cloneDeep(properties),
			reactors: cloneDeep(reactors),
		};
	}

	render(..._args: any[]) {}
}

import { uniqueId } from "@/lib/utils/crypto";
import { resolve, updateExistingProps } from "@/lib/utils/object";
import cloneDeep from "lodash/cloneDeep";

export default class Entity {
	[key: string]: unknown;

	static create = (
		Type: new (properties?: Record<string, unknown>) => Entity,
		config: Record<string, unknown>,
	) => {
		const { id, name, properties, displays, effects, ...props } = config;

		const entity = new Type(properties as Record<string, unknown>);

		for (const [key, value] of Object.entries(props)) {
			entity[key] = value;
		}

		entity.id = id;

		return entity;
	};

	constructor(name: string, properties: Record<string, unknown> = {}) {
		Object.defineProperties(this, {
			id: {
				value: uniqueId(),
				enumerable: true,
				writable: true,
			},
			name: {
				value: name,
				enumerable: true,
			},
			properties: {
				value: properties,
				enumerable: true,
			},
		});
	}

	update(properties: Record<string, unknown> = {}): boolean {
		return updateExistingProps(
			this.properties as Record<string, unknown>,
			resolve(properties, [this.properties]) as Record<string, unknown>,
		);
	}

	toString() {
		return `[${this.name} ${this.id}]`;
	}

	toJSON(): Record<string, unknown> {
		const { id, name, type, enabled, properties } = this;

		return {
			id,
			name,
			type,
			enabled,
			properties: cloneDeep(properties),
		};
	}
}

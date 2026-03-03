import Entity from "@/lib/core/Entity";
import type { ReactorConfig, RenderFrameData } from "@/lib/types";
import { getDisplayName } from "@/lib/utils/controls";
import cloneDeep from "lodash/cloneDeep";

export default class Display extends Entity {
	[key: string]: unknown;

	static create = (
		Type: new (properties?: Record<string, unknown>) => Entity,
		config: Record<string, unknown>,
	) => {
		const { reactors = {} } = config as {
			reactors?: Record<string, ReactorConfig>;
		};
		const entity = Entity.create(Type, config) as Display;

		for (const [key, value] of Object.entries(reactors)) {
			entity.setReactor(key, value);
		}

		return entity;
	};

	declare type: string;
	declare displayName: string;
	declare enabled: boolean;
	declare scene: unknown;
	declare reactors: Record<string, ReactorConfig>;

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

	getReactor(prop: string): ReactorConfig | undefined {
		return this.reactors[prop];
	}

	setReactor(prop: string, config: ReactorConfig) {
		this.reactors[prop] = config;
	}

	removeReactor(prop: string) {
		delete this.reactors[prop];
	}

	clearReactors() {
		this.reactors = {} as Record<string, ReactorConfig>;
	}

	updateReactors(data: RenderFrameData) {
		if (!data.hasUpdate) {
			return;
		}

		const { reactors } = this;
		const properties: Record<string, unknown> = {};
		let hasUpdate = false;

		for (const [key, value] of Object.entries(reactors)) {
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

	toJSON(): Record<string, unknown> {
		const { id, name, type, enabled, displayName, properties, reactors } =
			this;

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

	render(..._args: unknown[]) {}
}

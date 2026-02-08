import { createRoot, events as fiberEvents } from "@react-three/fiber";
import React from "react";
import LegacyBackend from "./LegacyBackend";

const VIEWPORT_ORIGIN = {
	top: 0,
	left: 0,
};

function R3FShellScene({ backgroundColor }) {
	return React.createElement("color", {
		attach: "background",
		args: [backgroundColor],
	});
}

export default class R3FBackend extends LegacyBackend {
	constructor(stage) {
		super(stage);

		this.root = null;
		this.rootReady = Promise.resolve();
		this.backgroundColor = stage.properties.backgroundColor;
		this.size = {
			width: stage.properties.width,
			height: stage.properties.height,
		};
	}

	init(params) {
		const initialized = super.init(params);
		const { canvas } = params;
		const { width, height } = this.stage.getSize();

		this.size = { width, height };
		this.backgroundColor = this.stage.properties.backgroundColor;

		this.mountRoot(canvas);
		this.syncRoot();

		return initialized;
	}

	update(properties) {
		const changed = super.update(properties);

		if (properties.width !== undefined || properties.height !== undefined) {
			const { width, height } = this.stage.getSize();
			this.size = { width, height };
		}

		if (properties.backgroundColor !== undefined) {
			this.backgroundColor = properties.backgroundColor;
		}

		this.syncRoot();

		return changed;
	}

	mountRoot(canvas) {
		if (!canvas || this.root) {
			return;
		}

		this.root = createRoot(canvas);
	}

	syncRoot() {
		if (!this.root) {
			return;
		}

		const { width, height } = this.size;
		const backgroundColor = this.backgroundColor;

		this.rootReady = this.rootReady
			.then(() =>
				this.root.configure({
					events: fiberEvents,
					gl: this.stage.renderer,
					frameloop: "demand",
					dpr: 1,
					size: { width, height, ...VIEWPORT_ORIGIN },
				}),
			)
			.then(() => {
				this.root.render(
					React.createElement(R3FShellScene, {
						backgroundColor,
					}),
				);
			})
			.catch((error) => {
				console.warn("[render] Failed to sync R3F shell:", error);
			});
	}

	dispose() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}

		this.rootReady = Promise.resolve();

		super.dispose();
	}
}

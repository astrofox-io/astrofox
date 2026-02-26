import React from "react";
import LegacyBackend from "./LegacyBackend";
import R3FStageRoot from "./R3FStageRoot";
import RenderBackend from "./RenderBackend";

const VIEWPORT_ORIGIN = {
	top: 0,
	left: 0,
};

const SUPPORTED_DISPLAYS = new Set([
	"ImageDisplay",
	"VideoDisplay",
	"ShapeDisplay",
	"BarSpectrumDisplay",
	"WaveSpectrumDisplay",
	"SoundWaveDisplay",
	"GeometryDisplay",
]);

let fiberModulePromise = null;

function loadFiberModule() {
	if (!fiberModulePromise) {
		fiberModulePromise = import("@react-three/fiber");
	}

	return fiberModulePromise;
}

function snapshotStage(stage) {
	const scenes = [...stage.scenes].map((scene) => ({
		id: scene.id,
		enabled: scene.enabled,
		properties: scene.properties,
		displays: [...scene.displays],
		effects: [...scene.effects],
	}));

	return { scenes };
}

function canRenderNatively(graph) {
	for (const scene of graph.scenes) {
		if (!scene.enabled) {
			continue;
		}

		const blendMode = scene.properties?.blendMode || "Normal";
		const masked = Boolean(scene.properties?.mask || scene.properties?.inverse);

		if (blendMode !== "Normal" || masked) {
			return false;
		}

		if ((scene.effects || []).length > 0) {
			return false;
		}

		for (const display of scene.displays || []) {
			if (!display.enabled) {
				continue;
			}

			if (!SUPPORTED_DISPLAYS.has(display.name)) {
				return false;
			}
		}
	}

	return true;
}

export default class R3FBackend extends RenderBackend {
	constructor(stage) {
		super();

		this.stage = stage;
		this.legacyBackend = new LegacyBackend(stage);

		this.root = null;
		this.fiberModule = null;
		this.mountPromise = null;
		this.configuredSize = null;

		this.initialized = false;
		this.r3fAvailable = true;
		this.canvas = null;

		this.graph = { scenes: [] };
		this.backgroundColor = stage.properties.backgroundColor;
		this.size = {
			width: stage.properties.width,
			height: stage.properties.height,
		};

		this.frameData = null;
		this.frameIndex = 0;
		this.renderMode = null;
	}

	init(params) {
		this.canvas = params.canvas;

		this.legacyBackend.init(params);

		this.size = this.legacyBackend.getSize();
		this.backgroundColor = this.stage.properties.backgroundColor;
		this.initialized = true;

		return true;
	}

	update(properties) {
		const changed = this.legacyBackend.update(properties);

		if (properties.width !== undefined || properties.height !== undefined) {
			this.size = this.legacyBackend.getSize();
		}

		if (properties.backgroundColor !== undefined) {
			this.backgroundColor = properties.backgroundColor;
		}

		if (this.root) {
			this.renderRoot();
		}

		return changed;
	}

	setRenderMode(mode) {
		if (this.renderMode === mode) {
			return;
		}

		this.renderMode = mode;
		console.info(`[render] Active mode: ${mode}`);
	}

	configureRoot(force = false) {
		if (!this.root || !this.fiberModule) {
			return;
		}

		const width = Math.max(1, Math.round(this.size.width || 1));
		const height = Math.max(1, Math.round(this.size.height || 1));

		if (
			!force &&
			this.configuredSize &&
			this.configuredSize.width === width &&
			this.configuredSize.height === height
		) {
			return;
		}

		this.root.configure({
			events: this.fiberModule.events,
			frameloop: "demand",
			dpr: 1,
			size: { width, height, ...VIEWPORT_ORIGIN },
		});

		this.configuredSize = { width, height };
	}

	renderRoot(force = false) {
		if (!this.root) {
			return;
		}

		this.configureRoot(force);

		const width = Math.max(1, Math.round(this.size.width || 1));
		const height = Math.max(1, Math.round(this.size.height || 1));

		this.root.render(
			React.createElement(R3FStageRoot, {
				width,
				height,
				backgroundColor: this.backgroundColor,
				scenes: this.graph.scenes,
				useFallback: false,
				fallbackTexture: null,
				frameData: this.frameData,
				frameIndex: this.frameIndex,
			}),
		);
	}

	mountRoot() {
		if (!this.canvas || this.root || this.mountPromise) {
			return;
		}

		this.mountPromise = loadFiberModule()
			.then((module) => {
				this.fiberModule = module;
				const { createRoot } = module;

				if (!this.root) {
					this.root = createRoot(this.canvas);
				}

				this.configureRoot(true);
				this.renderRoot(true);
			})
			.catch((error) => {
				this.r3fAvailable = false;

				const message = String(error?.message || error || "");

				if (message.includes("ReactCurrentOwner")) {
					console.info(
						"[render] R3F unavailable in this runtime; using legacy renderer.",
					);
					return;
				}

				console.warn("[render] Failed to mount R3F root:", error);
			})
			.finally(() => {
				if (!this.root) {
					this.mountPromise = null;
				}
			});
	}

	unmountRoot() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}

		this.mountPromise = null;
		this.fiberModule = null;
		this.configuredSize = null;
	}

	render(frameData) {
		if (!this.initialized) {
			return;
		}

		this.frameData = frameData;
		this.frameIndex += 1;
		this.graph = snapshotStage(this.stage);

		const nativeEnabled = this.r3fAvailable && canRenderNatively(this.graph);

		if (nativeEnabled) {
			if (!this.root) {
				this.mountRoot();
			}

			if (this.root) {
				this.setRenderMode("r3f-native");
				this.renderRoot();
				return;
			}
		}

		if (this.root) {
			this.unmountRoot();
		}

		this.setRenderMode("legacy");
		this.legacyBackend.render(frameData);
		this.size = this.legacyBackend.getSize();
	}

	async renderExportFrame(params) {
		return this.legacyBackend.renderExportFrame(params);
	}

	getSize() {
		return this.legacyBackend.getSize();
	}

	getPixels() {
		return this.legacyBackend.getPixels();
	}

	getImage(format) {
		return this.legacyBackend.getImage(format);
	}

	dispose() {
		this.unmountRoot();

		this.initialized = false;
		this.r3fAvailable = true;
		this.canvas = null;

		this.graph = { scenes: [] };
		this.frameData = null;
		this.frameIndex = 0;
		this.renderMode = null;

		this.legacyBackend.dispose();
	}
}

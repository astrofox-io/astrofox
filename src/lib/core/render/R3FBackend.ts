// @ts-nocheck
import { base64ToBytes } from "@/lib/utils/data";
import React from "react";
import * as THREE from "three";
import R3FStageRoot from "./R3FStageRoot";
import RenderBackend from "./RenderBackend";

const VIDEO_RENDERING = -1;

const VIEWPORT_ORIGIN = {
	top: 0,
	left: 0,
};

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

function updateNativeSceneState(scenes, frameData) {
	for (const scene of scenes || []) {
		if (!scene?.enabled) {
			continue;
		}

		if (scene.updateReactors) {
			scene.updateReactors(frameData);
		}

		for (const display of scene.displays || []) {
			if (!display?.enabled) {
				continue;
			}

			if (display.updateReactors) {
				display.updateReactors(frameData);
			}
		}

		for (const effect of scene.effects || []) {
			if (!effect?.enabled) {
				continue;
			}

			if (effect.updateReactors) {
				effect.updateReactors(frameData);
			}

			if (effect.render) {
				effect.render(scene, frameData);
			}
		}
	}
}

function readCanvasPixels(canvas, width, height) {
	const w = Math.max(1, Math.round(width || canvas.width || 1));
	const h = Math.max(1, Math.round(height || canvas.height || 1));

	const copy = document.createElement("canvas");
	copy.width = w;
	copy.height = h;

	const context = copy.getContext("2d", { willReadFrequently: true });

	if (!context) {
		return new Uint8Array(w * h * 4);
	}

	context.clearRect(0, 0, w, h);
	context.drawImage(canvas, 0, 0, w, h);

	return new Uint8Array(context.getImageData(0, 0, w, h).data.buffer);
}

export default class R3FBackend extends RenderBackend {
	constructor(stage) {
		super();

		this.stage = stage;
		this.root = null;
		this.fiberModule = null;
		this.mountPromise = null;
		this.configuredSize = null;

		this.initialized = false;
		this.r3fAvailable = true;
		this.canvas = null;
		this.invalidate = null;

		this.graph = { scenes: [] };
		this.backgroundColor = stage.properties.backgroundColor;
		this.size = {
			width: stage.properties.width,
			height: stage.properties.height,
		};

		this.frameData = null;
		this.frameIndex = 0;
		this.renderMode = null;
		this.pendingProperties = {};
		this.threeExtended = false;
	}

	setRenderMode(mode) {
		if (this.renderMode === mode) {
			return;
		}

		this.renderMode = mode;
		console.info(`[render] Active mode: ${mode}`);
	}

	applyProperties(properties = {}) {
		Object.assign(this.stage.properties, properties);

		if (properties.width !== undefined || properties.height !== undefined) {
			this.size = {
				width: Number(properties.width ?? this.size.width),
				height: Number(properties.height ?? this.size.height),
			};
		}

		if (properties.backgroundColor !== undefined) {
			this.backgroundColor = properties.backgroundColor;
		}
	}

	init({ canvas, width, height, backgroundColor }) {
		this.canvas = canvas;

		const properties = {
			...this.pendingProperties,
		};

		if (width !== undefined) {
			properties.width = width;
		}

		if (height !== undefined) {
			properties.height = height;
		}

		if (backgroundColor !== undefined) {
			properties.backgroundColor = backgroundColor;
		}

		this.pendingProperties = {};
		this.applyProperties(properties);
		this.initialized = true;

		this.mountRoot();

		return true;
	}

	update(properties) {
		if (!this.initialized) {
			Object.assign(this.pendingProperties, properties);
			this.applyProperties(properties);
			return true;
		}

		this.applyProperties(properties);

		if (this.root) {
			this.renderRoot();
		}

		return true;
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
			orthographic: true,
			camera: {
				position: [0, 0, 10],
				near: -1000,
				far: 1000,
				left: -width / 2,
				right: width / 2,
				top: height / 2,
				bottom: -height / 2,
				zoom: 1,
			},
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

		if (this.invalidate) {
			this.invalidate();
		}
	}

	async ensureRoot() {
		if (this.root) {
			return true;
		}

		if (!this.canvas) {
			return false;
		}

		if (!this.mountPromise) {
			this.mountPromise = loadFiberModule()
				.then((module) => {
					this.fiberModule = module;
					this.invalidate = module.invalidate || null;
					const { createRoot } = module;

					if (!this.threeExtended && module.extend) {
						module.extend(THREE);
						this.threeExtended = true;
					}

					if (!this.root) {
						this.root = createRoot(this.canvas);
					}

					this.configureRoot(true);
					this.renderRoot(true);
				})
				.catch((error) => {
					this.r3fAvailable = false;
					console.error("[render] Failed to mount R3F root:", error);
				})
				.finally(() => {
					if (!this.root) {
						this.mountPromise = null;
					}
				});
		}

		await this.mountPromise;

		return Boolean(this.root);
	}

	mountRoot() {
		this.ensureRoot();
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

		if (!this.r3fAvailable) {
			this.setRenderMode("r3f-error");
			return;
		}

		updateNativeSceneState(this.stage.scenes, frameData);

		this.frameData = frameData;
		this.frameIndex += 1;
		this.graph = snapshotStage(this.stage);

		if (!this.root) {
			this.mountRoot();
			this.setRenderMode("r3f-initializing");
			return;
		}

		this.setRenderMode("r3f");
		this.renderRoot();
	}

	async renderExportFrame({
		frame,
		fps,
		getAudioSample,
		analyzer,
		getFrameData,
	}) {
		if (!this.initialized) {
			return this.getPixels();
		}

		analyzer.process(getAudioSample(frame / fps));

		const frameData = getFrameData(VIDEO_RENDERING);
		frameData.delta = 1000 / fps;

		if (!this.root) {
			await this.ensureRoot();
		}

		this.render(frameData);

		await new Promise((resolve) => window.requestAnimationFrame(resolve));

		return this.getPixels();
	}

	getSize() {
		return {
			width: Math.max(1, Math.round(this.size.width || 1)),
			height: Math.max(1, Math.round(this.size.height || 1)),
		};
	}

	getPixels() {
		if (!this.canvas) {
			return new Uint8Array(4);
		}

		const { width, height } = this.getSize();

		try {
			return readCanvasPixels(this.canvas, width, height);
		} catch (_error) {
			return new Uint8Array(width * height * 4);
		}
	}

	getImage(format = "image/png") {
		if (!this.canvas) {
			return new Uint8Array();
		}

		const dataUrl = this.canvas.toDataURL(format);
		const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");

		return base64ToBytes(base64);
	}

	dispose() {
		this.unmountRoot();

		this.initialized = false;
		this.r3fAvailable = true;
		this.canvas = null;
		this.invalidate = null;

		this.graph = { scenes: [] };
		this.frameData = null;
		this.frameIndex = 0;
		this.renderMode = null;
		this.pendingProperties = {};
		this.threeExtended = false;
	}
}

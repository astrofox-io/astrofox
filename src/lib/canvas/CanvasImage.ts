import Entity from "@/lib/core/Entity";
import type { CanvasContext, CanvasElement } from "@/lib/types";
import { resetCanvas } from "@/lib/utils/canvas";

const MIN_RESIZE_WIDTH = 100;

export default class CanvasImage extends Entity {
	canvas: CanvasElement;
	context: CanvasContext;
	image: HTMLImageElement;
	mipmaps: OffscreenCanvas[];

	static defaultProperties = {
		src: "",
		width: 1,
		height: 1,
	};

	constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
		super("CanvasImage", { ...CanvasImage.defaultProperties, ...properties });

		const { src } = this.properties as Record<string, unknown>;

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d") as CanvasContext;
		this.mipmaps = [];

		this.image = new Image();
		this.image.onload = () => {
			this.generateMipMaps();
			this.render();
		};
		this.image.src = src as string;
	}

	getResizeSteps(sourceWidth: number, targetWidth: number) {
		return Math.ceil(Math.log(sourceWidth / targetWidth) / Math.log(2));
	}

	generateMipMaps() {
		const { image } = this;
		const steps = this.getResizeSteps(image.naturalWidth, MIN_RESIZE_WIDTH);
		const mipmaps: OffscreenCanvas[] = [];
		let src: HTMLImageElement | OffscreenCanvas = image;
		let width = image.naturalWidth / 2;
		let height = image.naturalHeight / 2;

		for (let i = 0; i < steps; i += 1) {
			const canvas = new OffscreenCanvas(width, height);

			canvas.getContext("2d")!.drawImage(src, 0, 0, width, height);

			mipmaps.push(canvas);

			src = mipmaps[i];
			width /= 2;
			height /= 2;
		}

		this.mipmaps = mipmaps;
	}

	update(properties: Record<string, unknown>) {
		const changed = super.update(properties);

		if (changed) {
			if (this.image.src !== (this.properties as Record<string, unknown>).src) {
				this.image.src = (this.properties as Record<string, unknown>)
					.src as string;
			}
		}

		return changed;
	}

	render() {
		const { canvas, context, image } = this;
		const { width, height } = this.properties as Record<string, number>;

		if (!image.src) return;

		// Reset canvas
		resetCanvas(canvas, width, height);

		// Resize smaller
		if (width < image.naturalWidth || height < image.naturalHeight) {
			let src: HTMLImageElement | OffscreenCanvas = image;

			this.mipmaps.forEach((map: OffscreenCanvas) => {
				if (width < map.width) {
					src = map;
				}
			});

			context.drawImage(src, 0, 0, width, height);
		}
		// Draw normally
		else {
			context.drawImage(image, 0, 0, width, height);
		}
	}
}

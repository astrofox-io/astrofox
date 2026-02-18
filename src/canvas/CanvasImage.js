import Entity from "@/core/Entity";
import { resetCanvas } from "@/utils/canvas";

const MIN_RESIZE_WIDTH = 100;

export default class CanvasImage extends Entity {
	static defaultProperties = {
		src: "",
		width: 1,
		height: 1,
	};

	constructor(properties, canvas) {
		super("CanvasImage", { ...CanvasImage.defaultProperties, ...properties });

		const { src } = this.properties;

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");

		this.image = new Image();
		this.image.onload = () => {
			this.generateMipMaps();
			this.render();
		};
		this.image.src = src;
	}

	getResizeSteps(sourceWidth, targetWidth) {
		return Math.ceil(Math.log(sourceWidth / targetWidth) / Math.log(2));
	}

	generateMipMaps() {
		const { image } = this;
		const steps = this.getResizeSteps(image.naturalWidth, MIN_RESIZE_WIDTH);
		const mipmaps = [];
		let src = image;
		let width = image.naturalWidth / 2;
		let height = image.naturalHeight / 2;

		for (let i = 0; i < steps; i += 1) {
			const canvas = new OffscreenCanvas(width, height);

			canvas.getContext("2d").drawImage(src, 0, 0, width, height);

			mipmaps.push(canvas);

			src = mipmaps[i];
			width /= 2;
			height /= 2;
		}

		this.mipmaps = mipmaps;
	}

	update(properties) {
		const changed = super.update(properties);

		if (changed) {
			if (this.image.src !== this.properties.src) {
				this.image.src = this.properties.src;
			}
		}

		return changed;
	}

	render() {
		const {
			canvas,
			context,
			image,
			properties: { width, height },
		} = this;

		if (!image.src) return;

		// Reset canvas
		resetCanvas(canvas, width, height);

		// Resize smaller
		if (width < image.naturalWidth || height < image.naturalHeight) {
			let src = image;

			this.mipmaps.forEach((map) => {
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

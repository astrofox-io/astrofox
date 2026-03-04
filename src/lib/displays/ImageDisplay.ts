import Display from "@/lib/core/Display";
import { isDefined } from "@/lib/utils/array";
import { BLANK_IMAGE } from "@/app/constants";

interface ImageDisplayInstance {
	hasImage: boolean;
	image: HTMLImageElement;
	scene: { getSize(): { width: number; height: number } };
	properties: Record<string, unknown>;
}

const disabled = (display: ImageDisplayInstance) => !display.hasImage;
const maxWidth = (display: ImageDisplayInstance) => {
	const { naturalWidth } = display.image;
	const { width } = display.scene.getSize();

	return naturalWidth > width ? naturalWidth : width;
};
const maxHeight = (display: ImageDisplayInstance) => {
	const { naturalHeight } = display.image;
	const { height } = display.scene.getSize();

	return naturalHeight > height ? naturalHeight : height;
};
const maxX = (display: ImageDisplayInstance) =>
	disabled(display) ? 0 : maxWidth(display);
const maxY = (display: ImageDisplayInstance) =>
	disabled(display) ? 0 : maxHeight(display);

export default class ImageDisplay extends Display {
	declare image: HTMLImageElement;

	static config = {
		name: "ImageDisplay",
		description: "Displays an image.",
		type: "display",
		label: "Image",
		defaultProperties: {
			src: BLANK_IMAGE,
			sourcePath: "",
			x: 0,
			y: 0,
			zoom: 1,
			width: 0,
			height: 0,
			fixed: true,
			rotation: 0,
			opacity: 0,
		},
		controls: {
			src: {
				label: "Image",
				type: "image",
			},
			width: {
				label: "Width",
				type: "number",
				min: 0,
				max: maxWidth,
				withRange: true,
				withLink: "fixed",
				disabled,
			},
			height: {
				label: "Height",
				type: "number",
				min: 0,
				max: maxHeight,
				withRange: true,
				withLink: "fixed",
				disabled,
			},
			x: {
				label: "X",
				type: "number",
				min: (display: ImageDisplayInstance) => -1 * maxX(display),
				max: (display: ImageDisplayInstance) => maxX(display),
				withRange: true,
				hideFill: true,
				disabled,
			},
			y: {
				label: "Y",
				type: "number",
				min: (display: ImageDisplayInstance) => -1 * maxY(display),
				max: (display: ImageDisplayInstance) => maxY(display),
				withRange: true,
				hideFill: true,
				disabled,
			},
			zoom: {
				label: "Zoom",
				type: "number",
				min: 1.0,
				max: 4.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
				disabled,
			},
			rotation: {
				label: "Rotation",
				type: "number",
				min: 0,
				max: 360,
				withRange: true,
				withReactor: true,
				disabled,
			},
			opacity: {
				label: "Opacity",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
				disabled,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(ImageDisplay, properties);

		this.image = new Image();
		const props = this.properties as Record<string, unknown>;
		this.image.src = props.src as string;
	}

	get hasImage() {
		return (this.properties as Record<string, unknown>).src !== BLANK_IMAGE;
	}

	update(properties: Record<string, unknown>) {
		const { src: inputSrc, fixed, width, height } = properties;
		const props = this.properties as Record<string, unknown>;
		const { src, width: w, height: h, fixed: f } = props;
		let image: HTMLImageElement | null = null;
		const srcChanged = typeof inputSrc === "string" && inputSrc !== src;

		// If we get an HTMLImageElement
		if (typeof inputSrc === "object" && (inputSrc as HTMLImageElement)?.src) {
			image = inputSrc as HTMLImageElement;

			if (image.src === BLANK_IMAGE) {
				// Image reset
				properties = { ...ImageDisplay.config.defaultProperties };
			} else if (image.src !== src) {
				// New image
				properties = {
					src: image.src,
					width: image.naturalWidth,
					height: image.naturalHeight,
					opacity: 1,
				};
			} else {
				properties.src = image.src;
			}
		}

		// Sync width/height values
		if (!image && !srcChanged && (fixed || f)) {
			const { naturalWidth, naturalHeight } = this.image;
			if (!naturalWidth || !naturalHeight) {
				return super.update({});
			}

			const ratio = naturalWidth / naturalHeight;

			if (!isDefined(width, height)) {
				if ((w as number) > (h as number)) {
					properties.height = Math.round((w as number) * (1 / ratio)) || 0;
					properties.width = Math.round((properties.height as number) * ratio);
				} else {
					properties.width = Math.round((h as number) * ratio);
					properties.height =
						Math.round((properties.width as number) * (1 / ratio)) || 0;
				}
			}

			if (width) {
				properties.height = Math.round((width as number) * (1 / ratio)) || 0;
			}
			if (height) {
				properties.width = Math.round((height as number) * ratio);
			}
		}

		const nextSrcChanged =
			typeof properties.src === "string" && properties.src !== src;

		const changed = super.update(properties);

		if (changed) {
			if (nextSrcChanged && properties.src !== BLANK_IMAGE) {
				if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
					this.image = image;
				} else {
					const nextImage = new Image();
					nextImage.onload = () => {
						this.image = nextImage;

						const p = this.properties as Record<string, unknown>;
						const nextProps: Record<string, unknown> = {};
						if (!p.width && !p.height) {
							nextProps.width = nextImage.naturalWidth;
							nextProps.height = nextImage.naturalHeight;
						}
						if (p.opacity === 0) {
							nextProps.opacity = 1;
						}

						if (Object.keys(nextProps).length > 0) {
							super.update(nextProps);
						}
					};
					nextImage.src = properties.src as string;
				}
			}
		}

		return changed;
	}
}

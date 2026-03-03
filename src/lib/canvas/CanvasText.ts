import Entity from "@/lib/core/Entity";
import type { CanvasContext, CanvasElement } from "@/lib/types";
import { resetCanvas } from "@/lib/utils/canvas";
import { resolveCanvasFontFamily } from "@/lib/view/fontFamilies";

export default class CanvasText extends Entity {
	canvas: CanvasElement;
	context: CanvasContext;
	loadingFonts: Set<string>;

	static defaultProperties = {
		text: "",
		size: 40,
		font: "Roboto",
		italic: false,
		bold: false,
		color: "#FFFFFF",
	};

	constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
		super("CanvasText", { ...CanvasText.defaultProperties, ...properties });

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d") as CanvasContext;
		this.loadingFonts = new Set();
	}

	normalizeFontFamily(font: string) {
		if (font === "Chunkfive") {
			return "Bevan";
		}
		if (font === "Intro") {
			return "Exo 2";
		}
		return resolveCanvasFontFamily(font);
	}

	getFont() {
		const { italic, bold, size, font } = this.properties as Record<
			string,
			unknown
		>;
		const fontFamily = this.normalizeFontFamily(font as string);

		return [
			italic ? "italic" : "normal",
			bold ? "bold" : "normal",
			`${size}px`,
			fontFamily,
		].join(" ");
	}

	loadFontIfNeeded(font: string, text: string) {
		if (!document.fonts) {
			return;
		}

		if (document.fonts.check(font, text || " ")) {
			return;
		}

		if (this.loadingFonts.has(font)) {
			return;
		}

		this.loadingFonts.add(font);

		document.fonts
			.load(font, text || " ")
			.then(() => this.render())
			.catch(() => {})
			.finally(() => {
				this.loadingFonts.delete(font);
			});
	}

	render() {
		const { canvas, context } = this;
		const { text, size, color } = this.properties as Record<string, unknown>;
		const font = this.getFont();

		this.loadFontIfNeeded(font, text as string);

		context.font = font;

		const length = Math.ceil(context.measureText(text as string).width);
		const spacing = (text as string).length
			? Math.ceil(length / (text as string).length)
			: 0;
		const width = Math.max(1, length + spacing);
		const height = Math.max(1, (size as number) * 2);

		// Reset canvas
		resetCanvas(canvas, width, height);

		// Draw text
		context.font = font;
		context.fillStyle = color as string;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(text as string, width / 2, height / 2);

		// Debugging
		/*
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2;
    context.strokeStyle = 'red';
    context.stroke();
    */
	}
}

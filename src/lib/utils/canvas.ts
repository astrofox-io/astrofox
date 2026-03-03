import type { CanvasContext, CanvasElement } from "@/lib/types";
import { deg2rad } from "./math";

export function getColor(start: string, end: string, pct: number) {
	const startColor = {
		r: Number.parseInt(start.substring(1, 3), 16),
		g: Number.parseInt(start.substring(3, 5), 16),
		b: Number.parseInt(start.substring(5, 7), 16),
	};

	const endColor = {
		r: Number.parseInt(end.substring(1, 3), 16),
		g: Number.parseInt(end.substring(3, 5), 16),
		b: Number.parseInt(end.substring(5, 7), 16),
	};

	const c = {
		r: ~~((endColor.r - startColor.r) * pct) + startColor.r,
		g: ~~((endColor.g - startColor.g) * pct) + startColor.g,
		b: ~~((endColor.b - startColor.b) * pct) + startColor.b,
	};

	return `#${c.r.toString(16)}${c.g.toString(16)}${c.b.toString(16)}`;
}

export function setColor(
	context: CanvasContext,
	color: string | string[],
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) {
	if (Array.isArray(color)) {
		const gradient = (context as CanvasRenderingContext2D).createLinearGradient(
			x1,
			y1,
			x2,
			y2,
		);

		for (let i = 0; i < color.length; i++) {
			gradient.addColorStop(i / (color.length - 1), color[i]);
		}

		context.fillStyle = gradient;
	} else {
		context.fillStyle = color;
	}
}

export function resetCanvas(canvas: CanvasElement, width = 1, height = 1) {
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	} else {
		(canvas as HTMLCanvasElement)
			.getContext("2d")
			?.clearRect(0, 0, width, height);
	}
}

interface RenderImageProps {
	x: number;
	y: number;
	opacity?: number;
	rotation?: number;
}

interface RenderOrigin {
	x: number;
	y: number;
}

export function renderImageToCanvas(
	context: CanvasContext,
	image: CanvasImageSource,
	props: RenderImageProps = { x: 0, y: 0 },
	origin: RenderOrigin = { x: 0, y: 0 },
) {
	const { width, height } = context.canvas;
	const { x, y, opacity, rotation } = props;

	const halfSceneWidth = width / 2;
	const halfSceneHeight = height / 2;

	context.globalAlpha = opacity ?? 1.0;

	if (rotation && rotation % 360 !== 0) {
		context.save();
		context.translate(halfSceneWidth + x, halfSceneHeight - y);
		context.rotate(deg2rad(rotation));
		context.drawImage(image, -origin.x, -origin.y);
		context.restore();
	} else {
		context.drawImage(
			image,
			halfSceneWidth + x - origin.x,
			halfSceneHeight - y - origin.y,
		);
	}

	context.globalAlpha = 1.0;
}

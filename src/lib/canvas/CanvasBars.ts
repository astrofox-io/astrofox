import Entity from "@/lib/core/Entity";
import type { CanvasContext, CanvasElement } from "@/lib/types";
import { resetCanvas, setColor } from "@/lib/utils/canvas";
import { clamp } from "@/lib/utils/math";

export default class CanvasBars extends Entity {
	canvas: CanvasElement;
	context: CanvasContext;

	static defaultProperties = {
		width: 300,
		height: 100,
		minHeight: 0,
		barWidth: -1,
		barSpacing: -1,
		shadowHeight: 100,
		color: "#FFFFFF",
		shadowColor: "#CCCCCC",
	};

	constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
		super("CanvasBars", { ...CanvasBars.defaultProperties, ...properties });

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d") as CanvasContext;
	}

	render(data: Float32Array | number[]) {
		const bars = data.length;
		const { canvas, context } = this;
		const { height, width, color, shadowHeight, shadowColor, minHeight } = this
			.properties as Record<string, unknown>;
		let { barWidth, barSpacing } = this.properties as Record<string, number>;

		// Reset canvas
		resetCanvas(
			canvas,
			width as number,
			(height as number) + (shadowHeight as number),
		);

		// Calculate bar widths
		if (barWidth < 0 && barSpacing < 0) {
			barSpacing = (width as number) / bars / 2;
			barWidth = barSpacing;
		} else if (barSpacing >= 0 && barWidth < 0) {
			barWidth = ((width as number) - bars * barSpacing) / bars;
			if (barWidth <= 0) barWidth = 1;
		} else if (barWidth > 0 && barSpacing < 0) {
			barSpacing = ((width as number) - bars * barWidth) / bars;
			if (barSpacing <= 0) barSpacing = 1;
		}

		// Calculate bars to display
		const barSize = barWidth + barSpacing;
		const fullWidth = barSize * bars;

		// Stepping
		const step =
			fullWidth > (width as number) ? fullWidth / (width as number) : 1;

		// Canvas setup
		setColor(context, color as string, 0, 0, 0, height as number);

		// Draw bars
		for (
			let i = 0, x = 0, last = null;
			i < bars && x < fullWidth;
			i += step, x += barSize
		) {
			const index = ~~i;

			if (index !== last) {
				const val = clamp(
					data[index] * (height as number),
					minHeight as number,
					height as number,
				);
				last = index;

				context.fillRect(x, height as number, barWidth, -val);
			}
		}

		// Draw shadow bars
		if ((shadowHeight as number) > 0) {
			setColor(
				context,
				shadowColor as string,
				0,
				height as number,
				0,
				(height as number) + (shadowHeight as number),
			);

			for (
				let i = 0, x = 0, last = null;
				i < bars && x < fullWidth;
				i += step, x += barSize
			) {
				const index = ~~i;

				if (index !== last) {
					const val = data[index] * (shadowHeight as number);
					last = index;

					context.fillRect(x, height as number, barWidth, val);
				}
			}
		}
	}
}

// @ts-nocheck
import React from "react";
import { TRIANGLE_ANGLE, HEXAGON_ANGLE, toRadians } from "../constants";
import { CanvasTextureLayer } from "./CanvasTextureLayer";

function drawShape(ctx, props, width, height) {
	const {
		shape = "Circle",
		fill = true,
		color = "#FFFFFF",
		stroke = false,
		strokeColor = "#FFFFFF",
		strokeWidth = 0,
	} = props;

	const w = width + strokeWidth * 2;
	const h = height + strokeWidth * 2;
	const cx = w / 2;
	const cy = h / 2;
	const radius = w > 0 ? w / 2 : 1;

	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = color;
	ctx.strokeStyle = strokeColor;
	ctx.lineWidth = strokeWidth;

	if (shape === "Circle") {
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
	} else if (shape === "Triangle") {
		const points = [];

		for (let i = 0; i < 3; i += 1) {
			points.push({
				x: cx + radius * Math.cos(i * TRIANGLE_ANGLE - toRadians(210)),
				y: cy + radius * Math.sin(i * TRIANGLE_ANGLE - toRadians(210)),
			});
		}

		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i += 1) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.closePath();
	} else if (shape === "Hexagon") {
		const points = [];

		for (let i = 0; i < 6; i += 1) {
			points.push({
				x: cx + radius * Math.cos(i * HEXAGON_ANGLE),
				y: cy + radius * Math.sin(i * HEXAGON_ANGLE),
			});
		}

		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i += 1) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.closePath();
	} else {
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(w, 0);
		ctx.lineTo(w, h);
		ctx.lineTo(0, h);
		ctx.closePath();
	}

	if (fill) {
		ctx.fill();
	}

	if (stroke && strokeWidth > 0) {
		ctx.save();
		ctx.clip();
		ctx.stroke();
		ctx.restore();
	}
}

export function ShapeDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
}) {
	const drawFrame = React.useCallback(({ context, properties }) => {
		const width = Math.max(
			1,
			Math.round(properties.width || properties.size || 100),
		);
		const height = Math.max(
			1,
			Math.round(
				properties.shape === "Rectangle"
					? properties.height || properties.width || 100
					: properties.width || properties.size || 100,
			),
		);

		const strokeWidth = Math.max(0, Math.round(properties.strokeWidth || 0));
		const canvasWidth = width + strokeWidth * 2;
		const canvasHeight = height + strokeWidth * 2;

		if (
			context.canvas.width !== canvasWidth ||
			context.canvas.height !== canvasHeight
		) {
			context.canvas.width = canvasWidth;
			context.canvas.height = canvasHeight;
		}

		drawShape(context, properties, width, height);

		return {
			width: canvasWidth,
			height: canvasHeight,
			originX: canvasWidth / 2,
			originY: canvasHeight / 2,
		};
	}, []);

	return (
		<CanvasTextureLayer
			display={display}
			order={order}
			frameData={frameData}
			sceneOpacity={sceneOpacity}
			sceneBlendMode={sceneBlendMode}
			sceneMask={sceneMask}
			sceneInverse={sceneInverse}
			sceneMaskCombine={sceneMaskCombine}
			drawFrame={drawFrame}
		/>
	);
}

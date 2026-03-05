// @ts-nocheck
import React from "react";
import FFTParser from "@/lib/audio/FFTParser";
import CanvasBars from "@/lib/canvas/CanvasBars";
import { CanvasTextureLayer } from "./CanvasTextureLayer";

export function BarSpectrumDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
}) {
	const barsRef = React.useRef(null);
	const parserRef = React.useRef(null);

	const drawFrame = React.useCallback(({ canvas, properties, frameData }) => {
		if (!barsRef.current) {
			barsRef.current = new CanvasBars(properties, canvas);
		}

		if (!parserRef.current) {
			parserRef.current = new FFTParser(properties);
		}

		barsRef.current.update(properties);
		parserRef.current.update(properties);

		const bins = Math.max(1, parserRef.current.totalBins || 64);
		const fftValues = frameData?.fft
			? parserRef.current.parseFFT(frameData.fft)
			: new Float32Array(bins);

		barsRef.current.render(fftValues);

		return {
			width: canvas.width,
			height: canvas.height,
			originX: canvas.width / 2,
			originY: canvas.height / 2,
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

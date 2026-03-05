// @ts-nocheck
import React from "react";
import FFTParser from "@/lib/audio/FFTParser";
import CanvasWave from "@/lib/canvas/CanvasWave";
import { CanvasTextureLayer } from "./CanvasTextureLayer";

function getWaveSpectrumPoints(fft, width) {
	const points = [];

	for (let i = 0, j = 0, k = 0; i < fft.length; i += 1) {
		j = fft[i];

		if (i === 0 || i === fft.length - 1 || k !== (j > fft[i - 1] ? 1 : -1)) {
			points.push(i * (width / fft.length));
			points.push(j);
		}

		k = j > fft[i - 1] ? 1 : -1;
	}

	if (points.length >= 2) {
		points[points.length - 2] = width;
	}

	return points;
}

export function WaveSpectrumDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
}) {
	const waveRef = React.useRef(null);
	const parserRef = React.useRef(null);

	const drawFrame = React.useCallback(({ canvas, properties, frameData }) => {
		if (!waveRef.current) {
			waveRef.current = new CanvasWave(properties, canvas);
		}

		if (!parserRef.current) {
			parserRef.current = new FFTParser(properties);
		}

		waveRef.current.update(properties);
		parserRef.current.update(properties);

		const bins = Math.max(1, parserRef.current.totalBins || 64);
		const fftValues = frameData?.fft
			? parserRef.current.parseFFT(frameData.fft)
			: new Float32Array(bins);

		const width = Math.max(1, Number(properties.width || canvas.width || 1));
		const points = getWaveSpectrumPoints(fftValues, width);

		waveRef.current.render(points, true);

		return {
			width: canvas.width,
			height: canvas.height,
			originX: canvas.width / 2,
			originY: Number(properties.height || canvas.height),
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

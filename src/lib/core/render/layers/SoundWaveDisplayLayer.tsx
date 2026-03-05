// @ts-nocheck
import React from "react";
import WaveParser from "@/lib/audio/WaveParser";
import CanvasWave from "@/lib/canvas/CanvasWave";
import { WAVELENGTH_MAX } from "../constants";
import { CanvasTextureLayer } from "./CanvasTextureLayer";

function getSoundWavePoints(values, width) {
	const step = width / (values.length - 1);

	return Array.from(values).flatMap((n, i) => [i * step, n]);
}

export function SoundWaveDisplayLayer({
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
			parserRef.current = new WaveParser(properties);
		}

		waveRef.current.update(properties);
		parserRef.current.update(properties);

		const width = Math.max(2, Number(properties.width || canvas.width || 2));
		const wavelength = Number(properties.wavelength || 0);
		const sampleSize =
			wavelength > 0
				? Math.max(2, ~~(width / (wavelength * WAVELENGTH_MAX * width)))
				: width;

		const values = frameData?.td
			? parserRef.current.parseTimeData(frameData.td, sampleSize)
			: new Float32Array(sampleSize);

		const points = getSoundWavePoints(values, width);
		const smooth = wavelength > 0.02;

		waveRef.current.render(points, smooth);

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

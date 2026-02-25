import FFTParser from "@/lib/audio/FFTParser";
import CanvasBars from "@/lib/canvas/CanvasBars";
import { FFT_SIZE, SAMPLE_RATE } from "@/lib/view/constants";
import React, { useEffect, useRef, useImperativeHandle } from "react";

const spectrumProperties = {
	width: 854,
	height: 50,
	barWidth: -1,
	barSpacing: 1,
	shadowHeight: 0,
	minHeight: 1,
	color: "#775FD8",
	backgroundColor: "#FF0000",
};

const parserProperties = {
	fftSize: FFT_SIZE,
	sampleRate: SAMPLE_RATE,
	smoothingTimeConstant: 0.5,
	minDecibels: -60,
	maxDecibels: -20,
	minFrequency: 0,
	maxFrequency: 10000,
};

export default function Spectrum({ forwardedRef }) {
	const canvas = useRef();
	const bars = useRef();
	const parser = useRef();
	const { width, height } = spectrumProperties;

	function handleClick() {
		const { normalize } = parser.current.properties;
		parser.current.update({ normalize: !normalize });
	}

	function draw(data) {
		const fft = parser.current.parseFFT(data.fft, 32);

		bars.current.render(fft);
	}

	useImperativeHandle(forwardedRef, () => ({ draw }));

	useEffect(() => {
		bars.current = new CanvasBars(spectrumProperties, canvas.current);
		parser.current = new FFTParser(parserProperties);
	}, [bars, parser]);

	return (
		<div className={"min-w-[900px] relative bg-gray75 pb-[10px]"}>
			<canvas
				ref={canvas}
				className={"block my-0 mx-auto border border-gray200 shadow-[inset_0_0_40px_rgba(0,_0,_0,_0.5)]"}
				width={width}
				height={height}
				onClick={handleClick}
			/>
		</div>
	);
}

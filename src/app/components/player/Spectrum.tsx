import FFTParser from "@/lib/audio/FFTParser";
import CanvasBars from "@/lib/canvas/CanvasBars";
import { FFT_SIZE, SAMPLE_RATE } from "@/app/constants";
import type React from "react";
import { useEffect, useImperativeHandle, useRef } from "react";

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

interface SpectrumProps {
	forwardedRef?: React.Ref<{
		draw: (data: { fft: Uint8Array | null }) => void;
	}>;
}

export default function Spectrum({ forwardedRef }: SpectrumProps) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const bars = useRef<CanvasBars | null>(null);
	const parser = useRef<FFTParser | null>(null);
	const { width, height } = spectrumProperties;

	function handleClick() {
		if (!parser.current) return;
		const props = parser.current.properties as Record<string, unknown>;
		parser.current.update({ normalize: !props.normalize });
	}

	function draw(data: { fft: Uint8Array | null }) {
		if (!parser.current || !bars.current || !data.fft) return;
		const fft = parser.current.parseFFT(data.fft, 32);

		bars.current.render(fft);
	}

	useImperativeHandle(forwardedRef, () => ({ draw }));

	useEffect(() => {
		bars.current = new CanvasBars(spectrumProperties, canvas.current!);
		parser.current = new FFTParser(parserProperties);
	}, [bars, parser]);

	return (
		<div className={"min-w-[56rem] relative bg-neutral-900 pb-[10px]"}>
			<canvas
				ref={canvas}
				className={
					"block my-0 mx-auto border border-neutral-800 shadow-[inset_0_0_40px_rgba(0,_0,_0,_0.5)]"
				}
				width={width}
				height={height}
				onClick={handleClick}
			/>
		</div>
	);
}

import WaveParser from "@/lib/audio/WaveParser";
import CanvasWave from "@/lib/canvas/CanvasWave";
import { PRIMARY_COLOR } from "@/app/constants";
import { events } from "@/app/global";
import React, { useRef, useEffect } from "react";

const canvasProperties = {
	width: 854,
	height: 50,
	midpoint: 25,
	strokeColor: PRIMARY_COLOR,
};

export default function Oscilloscope() {
	const { width, height } = canvasProperties;
	const canvas = useRef<HTMLCanvasElement>(null);
	const display = useRef<CanvasWave | null>(null);
	const parser = useRef<WaveParser | null>(null);

	function draw(...args: unknown[]) {
		const { td } = (args[0] ?? {}) as { td?: Float32Array | null };
		if (!parser.current || !display.current || !td) return;
		const data = parser.current.parseTimeData(td, width);

		display.current.render(
			new Float32Array(
				Array.from(data).flatMap((n: number, i: number) => [i, n]),
			),
			false,
		);
	}

	useEffect(() => {
		events.on("render", draw);
		display.current = new CanvasWave(canvasProperties, canvas.current!);
		parser.current = new WaveParser();

		return () => {
			events.off("render", draw);
		};
	}, []);

	return (
		<div className={"min-w-[56rem] relative bg-neutral-900 pb-[10px]"}>
			<canvas
				ref={canvas}
				className={
					"block my-0 mx-auto border border-neutral-800 shadow-[inset_0_0_40px_rgba(0,_0,_0,_0.5)]"
				}
				width={width}
				height={height}
			/>
		</div>
	);
}

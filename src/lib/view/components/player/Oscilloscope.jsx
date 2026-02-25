import WaveParser from "@/lib/audio/WaveParser";
import CanvasWave from "@/lib/canvas/CanvasWave";
import { PRIMARY_COLOR } from "@/lib/view/constants";
import { events } from "@/lib/view/global";
import React, { useRef, useEffect } from "react";

const canvasProperties = {
	width: 854,
	height: 50,
	midpoint: 25,
	strokeColor: PRIMARY_COLOR,
};

export default function Oscilloscope() {
	const { width, height } = canvasProperties;
	const canvas = useRef();
	const display = useRef();
	const parser = useRef();

	function draw({ td }) {
		const data = parser.current.parseTimeData(td, width);

		display.current.render(Array.from(data).flatMap((n, i) => [i, n]));
	}

	useEffect(() => {
		events.on("render", draw);
		display.current = new CanvasWave(canvasProperties, canvas.current);
		parser.current = new WaveParser();

		return () => {
			events.off("render", draw);
		};
	}, []);

	return (
		<div className={"min-w-[900px] relative bg-[var(--gray75)] pb-[10px]"}>
			<canvas
				ref={canvas}
				className={"block my-0 mx-auto border border-[var(--gray200)] shadow-[inset_0_0_40px_rgba(0,_0,_0,_0.5)]"}
				width={width}
				height={height}
			/>
		</div>
	);
}

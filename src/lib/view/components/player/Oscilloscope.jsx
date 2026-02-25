import WaveParser from "@/lib/audio/WaveParser";
import CanvasWave from "@/lib/canvas/CanvasWave";
import { PRIMARY_COLOR } from "@/lib/view/constants";
import { events } from "@/lib/view/global";
import React, { useRef, useEffect } from "react";
import styles from "./Oscilloscope.module.tailwind";

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
		<div className={styles.oscilloscope}>
			<canvas
				ref={canvas}
				className={styles.canvas}
				width={width}
				height={height}
			/>
		</div>
	);
}

// @ts-nocheck
import CanvasAudio from "@/lib/canvas/CanvasAudio";
import CanvasWave from "@/lib/canvas/CanvasWave";
import WaveParser from "@/lib/audio/WaveParser";
import { PRIMARY_COLOR } from "@/lib/view/constants";
import { player, events } from "@/lib/view/global";
import useSharedState from "@/lib/view/hooks/useSharedState";
import classNames from "classnames";
import React, { useRef, useEffect, useLayoutEffect, useMemo } from "react";

const canvasProperties = {
	width: 854,
	height: 70,
	shadowHeight: 30,
	barWidth: 3,
	barSpacing: 1,
	bgColor: "#333333",
	bars: 213,
};

const oscProperties = {
	width: 854,
	height: 50,
	midpoint: 25,
	strokeColor: PRIMARY_COLOR,
};

export default function AudioWaveform({ showWaveform = false, showOsc = false }: any) {
	const [state, setState] = useSharedState();
	const { progressPosition, seekPosition } = state;
	const { width, height, shadowHeight } = canvasProperties;
	const canvas = useRef<any>(null);
	const oscCanvas = useRef<any>(null);
	const oscDisplay = useRef<any>(null);
	const oscParser = useRef<any>(null);
	const hasAudioRef = useRef(false);
	const flatRenderedRef = useRef(false);

	const visible = showWaveform || showOsc;

	const [baseCanvas, progressCanvas, seekCanvas] = useMemo(
		() => [
			new CanvasAudio(
				{
					...canvasProperties,
					color: ["#555555", "#444444"],
					shadowColor: "#333333",
				},
				new OffscreenCanvas(width, height),
			),
			new CanvasAudio(
				{
					...canvasProperties,
					color: ["#B6AAFF", "#927FFF"],
					shadowColor: "#554B96",
				},
				new OffscreenCanvas(width, height),
			),
			new CanvasAudio(
				{
					...canvasProperties,
					color: ["#8880BF", "#6C5FBF"],
					shadowColor: "#403972",
				},
				new OffscreenCanvas(width, height),
			),
		],
		[],
	);

	function handleClick(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const progressPosition = (e.clientX - rect.left) / rect.width;

		player.seek(progressPosition);

		setState({ progressPosition, seekPosition: 0 });
	}

	function handleMouseMove(e) {
		e.stopPropagation();

		const rect = e.currentTarget.getBoundingClientRect();
		const seekPosition = (e.clientX - rect.left) / rect.width;

		setState({ seekPosition });
	}

	function handleMouseOut() {
		setState({ seekPosition: 0 });
	}

	function drawWaveform() {
		if (!canvas.current) return;

		const { width, height } = canvas.current;
		const context = canvas.current.getContext("2d");
		const position = progressPosition * width;
		const seek = seekPosition * width;
		const sx = seek < position ? seek : position;
		const dx = seek < position ? position - seek : seek - position;

		context.clearRect(0, 0, width, height);

		context.drawImage(
			baseCanvas.getCanvas(),
			position,
			0,
			width - position,
			height,
			position,
			0,
			width - position,
			height,
		);

		if (position > 0) {
			context.drawImage(
				progressCanvas.getCanvas(),
				0,
				0,
				position,
				height,
				0,
				0,
				position,
				height,
			);
		}

		if (seek > 0) {
			context.drawImage(
				seekCanvas.getCanvas(),
				sx,
				0,
				dx,
				height,
				sx,
				0,
				dx,
				height,
			);
		}
	}

	function renderFlatWaveform() {
		const { bars } = canvasProperties;
		const flatData = new Float32Array(bars).fill(0.05);
		baseCanvas.bars.render(flatData);
		progressCanvas.bars.render(flatData);
		seekCanvas.bars.render(flatData);
		flatRenderedRef.current = true;
	}

	function loadAudio() {
		const { buffer } = player.getAudio();

		baseCanvas.render(buffer);
		progressCanvas.render(buffer);
		seekCanvas.render(buffer);
		hasAudioRef.current = true;
		flatRenderedRef.current = false;
	}

	function drawOsc({ td }: any) {
		if (!oscDisplay.current || !oscParser.current) return;
		const data = oscParser.current.parseTimeData(td, oscProperties.width);
		oscDisplay.current.render(Array.from(data).flatMap((n, i) => [i, n]));
	}

	useEffect(() => {
		player.on("audio-load", loadAudio);

		return () => {
			player.off("audio-load", loadAudio);
		};
	}, []);

	useEffect(() => {
		if (showOsc && oscCanvas.current) {
			oscDisplay.current = new CanvasWave(oscProperties, oscCanvas.current);
			oscParser.current = new WaveParser();
			events.on("render", drawOsc);
		}

		return () => {
			events.off("render", drawOsc);
		};
	}, [showOsc]);

	useLayoutEffect(() => {
		if (showWaveform) {
			if (!hasAudioRef.current && !flatRenderedRef.current) {
				renderFlatWaveform();
			}
			drawWaveform();
		}
	});

	return (
		<div
			className={classNames({
				["min-w-[56rem] relative bg-neutral-900 border-t border-t-neutral-800 shadow-[inset_0_0_40px_rgba(0,_0,_0,_0.5)] max-h-64 transition-[max-height_0.2s_ease-out] overflow-hidden"]: true,
				["hidden max-h-0 transition-[max-height_0.2s_ease-in]"]: !visible,
			})}
		>
			{showWaveform && (
				<canvas
					ref={canvas}
					className={"mt-5 mx-auto block"}
					width={width}
					height={height + shadowHeight}
					onClick={handleClick}
					onMouseMove={handleMouseMove}
					onMouseOut={handleMouseOut}
				onBlur={handleMouseOut}
				/>
			)}
			{showOsc && (
				<canvas
					ref={oscCanvas}
					className={classNames("block mx-auto", {
						"mt-5": !showWaveform,
						"mt-1": showWaveform,
					})}
					width={oscProperties.width}
					height={oscProperties.height}
				/>
			)}
			<div className="h-5" />
		</div>
	);
}

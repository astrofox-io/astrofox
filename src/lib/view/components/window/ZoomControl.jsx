import useStage, {
	setZoom,
	zoomIn,
	zoomOut,
	fitToScreen,
} from "@/lib/view/actions/stage";
import React from "react";

export default function Zoom() {
	const { width, height, zoom } = useStage((state) => state);

	return (
		<div className={"flex items-center justify-center w-full leading-[28px] overflow-hidden"}>
			<button type="button" className={"inline-flex items-center border-0 bg-transparent text-inherit h-[28px] p-0 mr-[20px]"} onClick={() => setZoom(1)}>
				{`${width} x ${height}`}
			</button>
			<button type="button" className={"inline-flex items-center justify-center w-[30px] h-[28px] text-xs border-0 bg-transparent text-inherit p-0 [&:hover]:bg-[var(--primary200)]"} onClick={zoomOut}>
				{"\uff0d"}
			</button>
			<input
				className={"[--thumb-size:8px] [--track-size:2px] appearance-none [-webkit-appearance:none] h-[10px] w-[100px] bg-transparent relative text-[var(--text100)] m-[0_10px] [&::-webkit-slider-thumb]:[-webkit-appearance:none] [&::-webkit-slider-thumb]:[box-sizing:border-box] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[currentColor] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[currentColor] [&::-webkit-slider-thumb]:w-[var(--thumb-size)] [&::-webkit-slider-thumb]:h-[var(--thumb-size)] [&::-webkit-slider-thumb]:mt-[calc((var(--track-size)_-_var(--thumb-size))_/_2)] [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:h-[var(--track-size)] [&::-webkit-slider-runnable-track]:rounded-[1px] [&::-webkit-slider-runnable-track]:border-0 [&::-webkit-slider-runnable-track]:bg-[currentColor] [&::-moz-range-thumb]:[box-sizing:border-box] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[currentColor] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[currentColor] [&::-moz-range-thumb]:w-[var(--thumb-size)] [&::-moz-range-thumb]:h-[var(--thumb-size)] [&::-moz-range-track]:w-full [&::-moz-range-track]:h-[var(--track-size)] [&::-moz-range-track]:rounded-[1px] [&::-moz-range-track]:border-0 [&::-moz-range-track]:bg-[currentColor]"}
				type="range"
				name="zoom"
				value={zoom}
				onChange={(e) => setZoom(e.target.value)}
				min={0.1}
				max={3.0}
				step={0.02}
			/>
			<button type="button" className={"inline-flex items-center justify-center w-[30px] h-[28px] text-xs border-0 bg-transparent text-inherit p-0 [&:hover]:bg-[var(--primary200)]"} onClick={zoomIn}>
				{"\uff0b"}
			</button>
			<button type="button" className={"inline-flex items-center justify-center w-[50px] h-[28px] text-center border-0 bg-transparent text-inherit p-0"} onClick={fitToScreen}>
				{`${~~(zoom * 100)}%`}
			</button>
		</div>
	);
}

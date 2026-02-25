import { normalize } from "@/lib/utils/math";
import classNames from "classnames";
import React, { useState, useRef, useEffect } from "react";

export default function RangeInput({
	name = "range",
	value = 0,
	min = 0,
	max = 1,
	step = 1,
	lowerLimit = false,
	upperLimit = false,
	buffered = false,
	disabled = false,
	fillStyle = "left",
	hideFill = false,
	hideThumb = false,
	showThumbOnHover = false,
	smallThumb = false,
	className,
	onChange,
	onUpdate = () => {},
}) {
	const [bufferedValue, setBufferedValue] = useState(value);
	const buffering = useRef(false);

	useEffect(() => {
		if (!buffering.current) {
			setBufferedValue(value);
		}
	}, [value]);

	function handleChange(e) {
		let newValue = +e.currentTarget.value;

		if (lowerLimit !== false && newValue < lowerLimit) {
			newValue = lowerLimit;
		} else if (upperLimit !== false && newValue > upperLimit) {
			newValue = upperLimit;
		}

		if (buffered) {
			setBufferedValue(newValue);
			onUpdate(name, newValue);
		} else {
			onChange(name, newValue);
		}
	}

	function handleMouseDown() {
		buffering.current = true;
	}

	function handleMouseUp() {
		buffering.current = false;

		if (buffered) {
			onChange(name, bufferedValue);
		}
	}

	function getFillStyle() {
		const pct = normalize(buffered ? bufferedValue : value, min, max) * 100;

		switch (fillStyle) {
			case "left":
				return { width: `${pct}%` };
			case "right":
				return { width: `${100 - pct}%`, marginLeft: `${pct}%` };
			default:
				return { display: "none" };
		}
	}

	return (
		<div className={classNames("relative h-[20px] [&:disabled::-webkit-slider-thumb]:hidden", className)}>
			<div className={"absolute z-[0] top-1/2 -translate-y-1/2 h-[4px] w-full rounded-[4px] bg-[var(--gray300)] pointer-events-none"} />
			{!hideFill && <div className={"absolute z-[0] top-1/2 -translate-y-1/2 h-[4px] w-full rounded-[4px] bg-[var(--primary100)] pointer-events-none"} style={getFillStyle()} />}
			<input
				className={classNames("[--thumb-size:14px] [--track-size:4px] relative z-[1] w-full h-[20px] m-0 bg-transparent [&::-webkit-slider-thumb]:[-webkit-appearance:none] [&::-webkit-slider-thumb]:[box-sizing:border-box] [&::-webkit-slider-thumb]:w-[var(--thumb-size)] [&::-webkit-slider-thumb]:h-[var(--thumb-size)] [&::-webkit-slider-thumb]:mt-[calc((var(--track-size)_-_var(--thumb-size))_/_2)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--text100)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--gray400)] [&::-webkit-slider-thumb]:shadow-[0_2px_5px_rgba(0,_0,_0,_0.3)] [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:h-[var(--track-size)] [&::-webkit-slider-runnable-track]:border-0 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:[box-sizing:border-box] [&::-moz-range-thumb]:w-[var(--thumb-size)] [&::-moz-range-thumb]:h-[var(--thumb-size)] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--text100)] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--gray400)] [&::-moz-range-thumb]:shadow-[0_2px_5px_rgba(0,_0,_0,_0.3)] [&::-moz-range-track]:w-full [&::-moz-range-track]:h-[var(--track-size)] [&::-moz-range-track]:border-0 [&::-moz-range-track]:bg-transparent", {
					["[&::-webkit-slider-thumb]:[visibility:hidden] [&::-moz-range-thumb]:[visibility:hidden]"]: hideThumb,
					["[&:hover::-webkit-slider-thumb]:[visibility:visible] [&:hover::-moz-range-thumb]:[visibility:visible]"]: hideThumb && showThumbOnHover,
					["[--thumb-size:10px]"]: smallThumb,
				})}
				type="range"
				name={name}
				min={min}
				max={max}
				step={step}
				value={buffered ? bufferedValue : value}
				onChange={handleChange}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				disabled={disabled}
			/>
		</div>
	);
}

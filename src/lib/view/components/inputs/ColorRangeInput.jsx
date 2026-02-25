import { ColorInput } from "@/lib/view/components/inputs/index";
import React from "react";

export default function ColorRangeInput({
	name = "color",
	value = ["#ffffff", "#ffffff"],
	onChange,
}) {
	const [startColor, endColor] = value;

	return (
		<div className={"flex flex-row items-center w-full"}>
			<ColorInput
				name="startColor"
				value={startColor}
				onChange={(n, value) => onChange(name, [value, endColor])}
			/>
			<div
				className={"flex-1 relative h-[16px] border border-[var(--input-border-color)] rounded-[3px] m-[0_8px]"}
				style={{
					backgroundImage: `-webkit-linear-gradient(left, ${startColor}, ${endColor})`,
				}}
			/>
			<ColorInput
				name="endColor"
				value={endColor}
				onChange={(n, value) => onChange(name, [startColor, value])}
			/>
		</div>
	);
}
